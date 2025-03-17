// npx jest apps/gameplay-subgraph/src/mutations/shop/buy-fruit/buy-fruit.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    FruitSchema,
    getMongooseToken, 
    PlacedItemSchema, 
    PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema 
} from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { 
    GameplayConnectionService, 
    GameplayMockUserService, 
    TestingInfraModule 
} from "@src/testing"
import { Connection } from "mongoose"
import { BuyFruitService } from "./buy-fruit.service"
import { GraphQLError } from "graphql"

describe("BuyFruitService", () => {
    let connection: Connection
    let service: BuyFruitService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let mockKafkaProducer: { send: jest.Mock }
    let mockStaticService: any

    beforeAll(async () => {
        // Create mock fruit data
        const fruitId = "apple"
        const fruitObjectId = createObjectId(fruitId)
        
        // Create a mock Kafka producer
        mockKafkaProducer = {
            send: jest.fn().mockResolvedValue(undefined)
        }
        
        // Create a mock static service
        mockStaticService = {
            fruits: [
                {
                    id: fruitObjectId,
                    displayId: fruitId,
                    price: 500,
                    availableInShop: true
                },
                {
                    id: createObjectId("orange"),
                    displayId: "orange",
                    price: 600,
                    availableInShop: true
                },
                {
                    id: createObjectId("unavailable_fruit"),
                    displayId: "unavailable_fruit",
                    price: 300,
                    availableInShop: false
                }
            ],
            defaultInfo: {
                fruitLimit: 5
            }
        }

        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyFruitService]
        })
            .overrideProvider("KAFKA_PRODUCER")
            .useValue(mockKafkaProducer)
            .overrideProvider("StaticService")
            .useValue(mockStaticService)
            .compile()

        connection = module.get<Connection>(getMongooseToken())
        service = module.get<BuyFruitService>(BuyFruitService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        
        // Create fruit records in the database
        await connection.model<FruitSchema>(FruitSchema.name).create([
            {
                _id: fruitObjectId,
                displayId: fruitId,
                price: 500,
                availableInShop: true
            },
            {
                _id: createObjectId("orange"),
                displayId: "orange",
                price: 600,
                availableInShop: true
            },
            {
                _id: createObjectId("unavailable_fruit"),
                displayId: "unavailable_fruit",
                price: 300,
                availableInShop: false
            }
        ])
        
        // Create placed item types for fruits
        await connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).create([
            {
                type: PlacedItemType.Fruit,
                fruit: fruitObjectId
            },
            {
                type: PlacedItemType.Fruit,
                fruit: createObjectId("orange")
            },
            {
                type: PlacedItemType.Fruit,
                fruit: createObjectId("unavailable_fruit")
            }
        ])
    })

    beforeEach(() => {
        // Reset the mock before each test
        mockKafkaProducer.send.mockClear()
    })

    it("should successfully buy a fruit and update user and placed item", async () => {
        // Setup test data
        const x = 100, y = 100
        const fruitId = "apple"
        const fruit = await connection.model<FruitSchema>(FruitSchema.name).findById(createObjectId(fruitId))
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: fruit.price + 100 })
        
        // Store initial gold amount
        const initialGolds = user.golds

        // Call the service
        await service.buyFruit(
            { id: user.id },
            {
                fruitId,
                position: { x, y }
            }
        )

        // Verify user's gold was deducted
        const updatedUser = await connection
            .model<UserSchema>(UserSchema.name)
            .findById(user.id)
        
        expect(initialGolds - updatedUser.golds).toBe(fruit.price)

        // Verify fruit was placed
        const placedFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findOne({
                user: user.id,
                x,
                y
            })
        
        expect(placedFruit).toBeTruthy()
        expect(placedFruit.x).toBe(x)
        expect(placedFruit.y).toBe(y)
        expect(placedFruit.fruitInfo).toBeTruthy()
        expect(placedFruit.fruitInfo.fruit.toString()).toBe(fruit.id.toString())
        
        // Verify Kafka messages were sent
        expect(mockKafkaProducer.send).toHaveBeenCalledTimes(2)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        // Setup test data
        const fruitId = "apple"
        const fruit = await connection.model<FruitSchema>(FruitSchema.name).findById(createObjectId(fruitId))
        
        // Create user with insufficient gold
        const user = await gameplayMockUserService.generate({ golds: fruit.price - 10 })

        // Call the service and expect it to throw
        await expect(
            service.buyFruit(
                { id: user.id },
                {
                    fruitId,
                    position: { x: 10, y: 10 }
                }
            )
        ).rejects.toThrow(UserInsufficientGoldException)
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code FRUIT_NOT_FOUND when fruit does not exist", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Use a non-existent fruit ID
        const nonExistentId = "non_existent_fruit"

        // Call the service and expect it to throw
        try {
            await service.buyFruit(
                { id: user.id },
                {
                    fruitId: nonExistentId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_FOUND")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code FRUIT_NOT_AVAILABLE_IN_SHOP when fruit is not available", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Use an unavailable fruit ID
        const unavailableFruitId = "unavailable_fruit"

        // Call the service and expect it to throw
        try {
            await service.buyFruit(
                { id: user.id },
                {
                    fruitId: unavailableFruitId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_AVAILABLE_IN_SHOP")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code MAX_FRUIT_LIMIT_REACHED when fruit limit is reached", async () => {
        // Setup test data
        const fruitId = "apple"
        const fruit = await connection.model<FruitSchema>(FruitSchema.name).findById(createObjectId(fruitId))
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: fruit.price * 10 })
        
        // Get placed item type for fruit
        const placedItemType = await connection
            .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .findOne({ 
                type: PlacedItemType.Fruit,
                fruit: fruit.id 
            })

        // Create fruits up to the limit
        for (let i = 0; i < mockStaticService.defaultInfo.fruitLimit; i++) {
            await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
                user: user.id,
                placedItemType: placedItemType.id,
                x: i * 10,
                y: i * 10,
                fruitInfo: {
                    fruit: fruit.id
                }
            })
        }

        // Call the service and expect it to throw
        try {
            await service.buyFruit(
                { id: user.id },
                {
                    fruitId,
                    position: { x: 100, y: 100 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("MAX_FRUIT_LIMIT_REACHED")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should throw GraphQLError with code PLACED_ITEM_TYPE_NOT_FOUND when placed item type is not found", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Create a fruit with no placed item type
        const fruitWithNoPlacedItemType = await connection.model<FruitSchema>(FruitSchema.name).create({
            displayId: "fruit_with_no_placed_item_type",
            price: 500,
            availableInShop: true
        })

        // Call the service and expect it to throw
        try {
            await service.buyFruit(
                { id: user.id },
                {
                    fruitId: fruitWithNoPlacedItemType.id.toString(),
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_TYPE_NOT_FOUND")
        }
        
        // Verify no Kafka messages were sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
        
        // Clean up
        await connection.model<FruitSchema>(FruitSchema.name).deleteOne({ _id: fruitWithNoPlacedItemType.id })
    })

    it("should handle Kafka producer errors gracefully", async () => {
        // Setup test data
        const x = 100, y = 100
        const fruitId = "apple"
        const fruit = await connection.model<FruitSchema>(FruitSchema.name).findById(createObjectId(fruitId))
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: fruit.price + 100 })

        // Make the Kafka producer throw an error
        mockKafkaProducer.send.mockRejectedValueOnce(new Error("Kafka error"))

        // Call the service and expect it to throw
        await expect(
            service.buyFruit(
                { id: user.id },
                {
                    fruitId,
                    position: { x, y }
                }
            )
        ).rejects.toThrow("Kafka error")
    })

    afterAll(async () => {
        await connection.model<FruitSchema>(FruitSchema.name).deleteMany({})
        await connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).deleteMany({})
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
}) 