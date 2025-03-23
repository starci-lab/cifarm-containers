// npx jest apps/gameplay-subgraph/src/mutations/shop/buy-animal/buy-animal.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    AnimalId, 
    AnimalSchema, 
    getMongooseToken, 
    PlacedItemSchema, 
    PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema 
} from "@src/databases"
import { StaticService, UserInsufficientGoldException } from "@src/gameplay"
import { 
    GameplayConnectionService, 
    GameplayMockUserService, 
    TestingInfraModule 
} from "@src/testing"
import { Connection } from "mongoose"
import { BuyAnimalService } from "./buy-animal.service"
import { GraphQLError } from "graphql"

describe("BuyAnimalService", () => {
    let connection: Connection
    let service: BuyAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyAnimalService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<BuyAnimalService>(BuyAnimalService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
    })

    it("should successfully buy an animal and update user and placed item", async () => {
        // Setup test data
        const x = 100, y = 100
        const animal = staticService.animals.find(
            (animal) => animal.displayId === AnimalId.Cow
        )
        
        // Ensure animal is available in shop
        await connection.model<AnimalSchema>(AnimalSchema.name)
            .updateOne(
                { _id: createObjectId(animal.id) },
                { $set: { availableInShop: true } }
            )
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: animal.price + 100 })
        
        // Get building type for the animal
        const building = staticService.buildings.find(
            (building) => building.animalContainedType === animal.type
        )
        
        // Create placed item type for building
        const placedItemBuildingType = staticService.placedItemTypes.find(
            (placedItemType) => placedItemType.type === PlacedItemType.Building && placedItemType.building.toString() === building.id.toString()
        )
        
        // Create a building for the animal
        await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            placedItemType: placedItemBuildingType.id,
            x: x + 10, // Different position from animal
            y: y + 10,
            buildingInfo: {
                building: building.id,
                currentUpgrade: 1
            }
        })

        // Store initial gold amount
        const initialGolds = user.golds

        // Call the service
        await service.buyAnimal(
            { id: user.id },
            {
                animalId: AnimalId.Cow,
                position: { x, y }
            }
        )

        // Verify user's gold was deducted
        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findById(user.id)
        expect(initialGolds - updatedUser.golds).toBe(animal.price)

        // Verify animal was placed
        const placedAnimal = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findOne({
            user: user.id,
            x,
            y,
            "animalInfo.animal": createObjectId(AnimalId.Cow)
        })
        
        expect(placedAnimal).toBeTruthy()
        expect(placedAnimal.x).toBe(x)
        expect(placedAnimal.y).toBe(y)
        
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        // Setup test data
        const animal = staticService.animals.find(
            (animal) => animal.displayId === AnimalId.Cow
        )
        
        // Ensure animal is available in shop
        await connection.model<AnimalSchema>(AnimalSchema.name)
            .updateOne(
                { _id: createObjectId(AnimalId.Cow) },
                { $set: { availableInShop: true } }
            )
        
        // Create user with insufficient gold
        const user = await gameplayMockUserService.generate({ golds: animal.price - 10 })
        
        // Get building type for the animal
        const building = staticService.buildings.find(
            (building) => building.animalContainedType === animal.type
        )
        
        // Create placed item type for building
        const placedItemBuildingType = staticService.placedItemTypes.find(
            (placedItemType) => placedItemType.type === PlacedItemType.Building && placedItemType.building === building.id
        )
        
        // Create a building for the animal
        await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            placedItemType: placedItemBuildingType.id,
            x: 0,
            y: 0,
            buildingInfo: {
                building: building.id,
                currentUpgrade: 1
            }
        })

        // Call the service and expect it to throw
        await expect(
            service.buyAnimal(
                { id: user.id },
                {
                    animalId: AnimalId.Cow,
                    position: { x: 10, y: 10 }
                }
            )
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    it("should throw GraphQLError with code ANIMAL_NOT_FOUND when animal does not exist", async () => {
        // Create user
        const user = await gameplayMockUserService.generate({ golds: 1000 })
        
        // Use a non-existent animal ID
        const nonExistentId = "chicken_invalid" as AnimalId

        // Call the service and expect it to throw
        try {
            await service.buyAnimal(
                { id: user.id },
                {
                    animalId: nonExistentId,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_AVAILABLE_IN_SHOP when animal is not available in shop", async () => {
        // Setup test data
        const animal = staticService.animals.find(
            (animal) => animal.displayId === AnimalId.Cow
        )
        
        // Make animal unavailable in shop
        await connection.model<AnimalSchema>(AnimalSchema.name)
            .updateOne(
                { _id: createObjectId(AnimalId.Cow) },
                { $set: { availableInShop: false } }
            )
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: animal.price + 100 })

        // Call the service and expect it to throw
        try {
            await service.buyAnimal(
                { id: user.id },
                {
                    animalId: AnimalId.Cow,
                    position: { x: 0, y: 0 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_AVAILABLE_IN_SHOP")
        }
        
        // Reset animal to available for other tests
        await connection.model<AnimalSchema>(AnimalSchema.name)
            .updateOne(
                { _id: createObjectId(AnimalId.Cow) },
                { $set: { availableInShop: true } }
            )
    })

    it("should throw GraphQLError with code MAX_CAPACITY_REACHED when user has reached max animal capacity", async () => {
        // Setup test data
        const animal = staticService.animals.find(
            (animal) => animal.displayId === AnimalId.Cow
        )
        
        // Create user with enough gold
        const user = await gameplayMockUserService.generate({ golds: animal.price + 100 })
        
        // Get building type for the animal
        const building = staticService.buildings.find(
            (building) => building.animalContainedType === animal.type
        )
        
        // Create placed item type for building
        const placedItemBuildingType = await connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .findOne({
                type: PlacedItemType.Building,
                building: building.id
            })
        
        // Create placed item type for animal
        const placedItemAnimalType = await connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .findOne({
                type: PlacedItemType.Animal,
                animal: animal.id
            })  
        
        // Create a building with capacity 1
        await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            placedItemType: placedItemBuildingType.id,
            x: 0,
            y: 0,
            buildingInfo: {
                building: building.id,
                currentUpgrade: 1 // Assuming upgrade 1 has capacity 1
            }
        })
        
        // Create an animal to fill the capacity
        await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            placedItemType: placedItemAnimalType.id,
            x: 10,
            y: 10,
            animalInfo: {
                animal: animal.id
            }
        })

        // Call the service and expect it to throw
        try {
            await service.buyAnimal(
                { id: user.id },
                {
                    animalId: AnimalId.Cow,
                    position: { x: 20, y: 20 }
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("MAX_CAPACITY_REACHED")
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
