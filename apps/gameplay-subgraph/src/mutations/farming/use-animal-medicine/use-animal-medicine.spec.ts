// npx jest apps/gameplay-subgraph/src/mutations/farming/cure-animal/cure-animal.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { CureAnimalService } from "./use-animal-medicine.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import {
    getMongooseToken,
    PlacedItemSchema,
    InventorySchema,
    UserSchema,
    AnimalCurrentState,
    PlacedItemTypeId,
    InventoryKind,
    InventoryType,
    InventoryTypeId,
    SystemId,
    SystemSchema,
    Activities,
    KeyValueRecord
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("CureAnimalService", () => {
    let service: CureAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [CureAnimalService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<CureAnimalService>(CureAnimalService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully cure the sick animal and update user stats", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume, experiencesGain } = activities.value.cureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal medicine inventory
        const animalMedicineType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalMedicine
        )

        // Create inventory with animal medicine
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalMedicineType.id,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Sick
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Call the service method to cure the animal
        await service.cureAnimal(
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

    it("should throw GraphQLError with code INVENTORY_ANIMAL_MEDICINE_NOT_FOUND when medicine is not found", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.cureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Sick
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Create a non-medicine inventory
        const nonMedicineType = staticService.inventoryTypes.find(
            type => type.displayId !== InventoryTypeId.AnimalMedicine && type.type === InventoryType.Supply
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: nonMedicineType.id,
            kind: InventoryKind.Tool,
            index: 0
        })

        try {
            await service.cureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVENTORY_ANIMAL_MEDICINE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code PLACED_ITEM_ANIMAL_NOT_FOUND when animal is not found", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.cureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal medicine inventory
        const animalMedicineType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalMedicine
        )

        // Create inventory with animal medicine
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalMedicineType.id,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemAnimalId = createObjectId()

        try {
            await service.cureAnimal(
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

    it("should throw GraphQLError with code CANNOT_CURE_OTHERS_ANIMAL when animal belongs to another user", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.cureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal medicine inventory
        const animalMedicineType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalMedicine
        )

        // Create inventory with animal medicine
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalMedicineType.id,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a sick animal owned by another user
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Sick
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.cureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_CURE_OTHERS_ANIMAL")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_SICK when animal is not sick", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.cureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal medicine inventory
        const animalMedicineType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalMedicine
        )

        // Create inventory with animal medicine
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalMedicineType.id,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a healthy animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Normal // Not sick
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.cureAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_SICK")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.cureAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create animal medicine inventory
        const animalMedicineType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalMedicine
        )

        // Create inventory with animal medicine
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalMedicineType.id,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a sick animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Sick
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.cureAnimal(
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
