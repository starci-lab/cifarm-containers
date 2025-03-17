// npx jest apps/gameplay-subgraph/src/mutations/community/help-cure-animal/help-cure-animal.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    AnimalCurrentState, 
    getMongooseToken, 
    PlacedItemSchema, 
    UserSchema,
    PlacedItemTypeId,
    InventorySchema,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { HelpCureAnimalService } from "./help-cure-animal.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("HelpCureAnimalService", () => {
    let connection: Connection
    let service: HelpCureAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HelpCureAnimalService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<HelpCureAnimalService>(HelpCureAnimalService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully help cure the sick animal and update user stats", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Sick,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Create animal medicine in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        // Call the service method to help cure the animal
        await service.helpCureAnimal(
            { id: user.id },
            {
                placedItemAnimalId: placedItemAnimal.id
            }
        )

        const userAfter = await connection
            .model<UserSchema>(UserSchema.name)
            .findById(user.id)
            .select("energy level experiences")

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Check if the animal's state was updated
        const updatedPlacedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemAnimal.id)

        expect(updatedPlacedItemAnimal.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
    })

    it("should throw GraphQLError with code ANIMAL_MEDICINE_NOT_FOUND when user has no animal medicine", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Sick,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // No animal medicine is created in the user's inventory

        try {
            await service.helpCureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_MEDICINE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code PLACED_ITEM_ANIMAL_NOT_FOUND when animal is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal medicine in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        const invalidPlacedItemAnimalId = createObjectId()

        try {
            await service.helpCureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: invalidPlacedItemAnimalId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_ANIMAL_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code CANNOT_HELP_CURE_OWN_ANIMAL when animal belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Sick,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Create animal medicine in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpCureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_HELP_CURE_OWN_ANIMAL")
        }
    })

    it("should throw GraphQLError with code ANIMAL_IS_NOT_SICK when animal is not sick", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with a healthy animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Normal, // Not sick
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Create animal medicine in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpCureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_IS_NOT_SICK")
        }
    })

    it("should throw GraphQLError with code NO_ANIMAL when placed item has no animal", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with no animal info
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create animal medicine in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpCureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("NO_ANIMAL")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpCureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Sick,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Create animal medicine in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpCureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(EnergyNotEnoughException)
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
