// npx jest apps/gameplay-subgraph/src/mutations/shop/buy-building/buy-building.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    BuildingId,
    getMongooseToken, 
    PlacedItemSchema, 
    PlacedItemType,
    UserSchema 
} from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { 
    GameplayConnectionService, 
    GameplayMockUserService, 
    TestingInfraModule 
} from "@src/testing"
import { Connection } from "mongoose"
import { BuyBuildingService } from "./buy-building.service"
import { GraphQLError } from "graphql"

describe("BuyBuildingService", () => {
    let connection: Connection
    let service: BuyBuildingService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let mockKafkaProducer: { send: jest.Mock }
    let staticService: 

    beforeAll(async () => {
        // Create mock building data
        const buildingId = BuildingId.Barn
        const buildingObjectId = createObjectId(buildingId)
        
        // Create a mock Kafka producer
        mockKafkaProducer = {
            send: jest.fn().mockResolvedValue(undefined)
        }
        
        // Create a mock static service
        mockStaticService = {
            buildings: [
                {
                    id: buildingObjectId,
                    displayId: buildingId,
                    price: 1000,
                    availableInShop: true,
                    maxOwnership: 3
                },
                {
                    id: createObjectId("chicken_coop"),
                    displayId: BuildingId.ChickenCoop,
                    price: 800,
                    availableInShop: true,
                    maxOwnership: 2
                },
                {
                    id: createObjectId("unavailable_building"),
                    displayId: "unavailable_building" as BuildingId,
                    price: 500,
                    availableInShop: false,
                    maxOwnership: 1
                }
            ],
            placedItemTypes: [
                {
                    id: createObjectId("barn_placed_item_type"),
                    type: PlacedItemType.Building,
                    building: buildingObjectId
                },
                {
                    id: createObjectId("chicken_coop_placed_item_type"),
                    type: PlacedItemType.Building,
                    building: createObjectId("chicken_coop")
                }
            ],
            defaultInfo: {
                buildingLimit: 5
            }
        }

        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyBuildingService]
        })
            .overrideProvider("KAFKA_PRODUCER")
            .useValue(mockKafkaProducer)
            .overrideProvider("StaticService")
            .useValue(mockStaticService)
            .compile()

        connection = module.get<Connection>(getMongooseToken())
        service = module.get<BuyBuildingService>(BuyBuildingService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
    })

    beforeEach(() => {
        // Reset the mock before each test
        mockKafkaProducer.send.mockClear()
    })

    it("should successfully buy a building and update user and placed item", async () => {
        // Setup test data
        const x = 100, y = 100
        const buildingId = BuildingId.Barn
        const building = mockStaticService.buildings.find(b => b.displayId === buildingId)
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: building.price + 100 })
        
        // Get placed item type for building
        const placedItemType = mockStaticService.placedItemTypes.find(
            pit => pit.building.toString() === building.id.toString()
        )

        // Store initial gold amount
        const initialGolds = user.golds

        // Call the service
        await service.buyBuilding(
            { id: user.id },
            {
                buildingId,
                position: { x, y }
            }
        )

        // Verify user's gold was deducted
        const updatedUser = await connection
            .model<UserSchema>(UserSchema.name)
            .findById(user.id)
        
        expect(initialGolds - updatedUser.golds).toBe(building.price)

        // Verify building was placed
        const placedBuilding = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findOne({
                user: user.id,
                x,
                y,
                placedItemType: placedItemType.id
            })
        
        expect(placedBuilding).toBeTruthy()
        expect(placedBuilding.x).toBe(x)
        expect(placedBuilding.y).toBe(y)
        expect(placedBuilding.buildingInfo.currentUpgrade).toBe(1)
        
        // Verify Kafka messages were sent
        expect(mockKafkaProducer.send).toHaveBeenCalledTimes(2)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        // Setup test data
        const buildingId = BuildingId.Barn
        const building = mockStaticService.buildings.find(b => b.displayId === buildingId)
        
        // Create user with insufficient gold
        const user = await gameplayMockUserService.generate({ golds: building.price - 10 })

        // Call the service and expect it to throw
        await expect(
            service.buyBuilding(
                { id: user.id },
                {
                    buildingId,
                    position: { x: 10, y: 10 }
                }
            )
        ).rejects.toThrow(UserInsufficientGoldException)
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code BUILDING_NOT_FOUND when building does not exist", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Use a non-existent building ID
        const nonExistentId = "non_existent_building" as BuildingId

        // Call the service and expect it to throw
        try {
            await service.buyBuilding(
                { id: user.id },
                {
                    buildingId: nonExistentId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("BUILDING_NOT_FOUND")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code BUILDING_NOT_AVAILABLE_IN_SHOP when building is not available", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Use an unavailable building ID
        const unavailableBuildingId = "unavailable_building" as BuildingId

        // Call the service and expect it to throw
        try {
            await service.buyBuilding(
                { id: user.id },
                {
                    buildingId: unavailableBuildingId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("BUILDING_NOT_AVAILABLE_IN_SHOP")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code MAX_BUILDING_OWNERSHIP_REACHED when total building limit is reached", async () => {
        // Setup test data
        const buildingId = BuildingId.Barn
        const building = mockStaticService.buildings.find(b => b.displayId === buildingId)
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: building.price * 10 })
        
        // Get placed item type for building
        const placedItemType = mockStaticService.placedItemTypes.find(
            pit => pit.building.toString() === building.id.toString()
        )

        // Override the building limit to 0 to force the error
        const originalBuildingLimit = mockStaticService.defaultInfo.buildingLimit
        mockStaticService.defaultInfo.buildingLimit = 0

        // Call the service and expect it to throw
        try {
            await service.buyBuilding(
                { id: user.id },
                {
                    buildingId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("MAX_BUILDING_OWNERSHIP_REACHED")
        } finally {
            // Restore the original building limit
            mockStaticService.defaultInfo.buildingLimit = originalBuildingLimit
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code MAX_BUILDING_OWNERSHIP_REACHED when specific building limit is reached", async () => {
        // Setup test data
        const buildingId = BuildingId.Barn
        const building = mockStaticService.buildings.find(b => b.displayId === buildingId)
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: building.price * 10 })
        
        // Get placed item type for building
        const placedItemType = mockStaticService.placedItemTypes.find(
            pit => pit.building.toString() === building.id.toString()
        )

        // Create buildings up to the max ownership limit
        for (let i = 0; i < building.maxOwnership; i++) {
            await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
                user: user.id,
                placedItemType: placedItemType.id,
                x: i * 10,
                y: i * 10,
                buildingInfo: {
                    building: building.id,
                    currentUpgrade: 1
                }
            })
        }

        // Call the service and expect it to throw
        try {
            await service.buyBuilding(
                { id: user.id },
                {
                    buildingId,
                    position: { x: 100, y: 100 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("MAX_BUILDING_OWNERSHIP_REACHED")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code PLACED_ITEM_TYPE_NOT_FOUND when placed item type is not found", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Create a building ID that exists but has no placed item type
        const buildingWithNoPlacedItemType: MockBuilding = {
            id: createObjectId("building_with_no_placed_item_type"),
            displayId: "building_with_no_placed_item_type" as BuildingId,
            price: 500,
            availableInShop: true,
            maxOwnership: 1
        }
        
        // Add the building to the mock static service
        mockStaticService.buildings.push(buildingWithNoPlacedItemType)

        // Call the service and expect it to throw
        try {
            await service.buyBuilding(
                { id: user.id },
                {
                    buildingId: buildingWithNoPlacedItemType.displayId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_TYPE_NOT_FOUND")
        } finally {
            // Remove the added building
            mockStaticService.buildings = mockStaticService.buildings.filter(
                b => b.displayId !== buildingWithNoPlacedItemType.displayId
            )
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should handle Kafka producer errors gracefully", async () => {
        // Setup test data
        const x = 100, y = 100
        const buildingId = BuildingId.Barn
        const building = mockStaticService.buildings.find(b => b.displayId === buildingId)
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: building.price + 100 })

        // Make the Kafka producer throw an error
        mockKafkaProducer.send.mockRejectedValueOnce(new Error("Kafka error"))

        // Call the service and expect it to throw
        await expect(
            service.buyBuilding(
                { id: user.id },
                {
                    buildingId,
                    position: { x, y }
                }
            )
        ).rejects.toThrow("Kafka error")
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
