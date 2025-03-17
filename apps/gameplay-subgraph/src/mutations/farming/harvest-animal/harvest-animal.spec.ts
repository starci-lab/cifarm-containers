// npx jest apps/gameplay-subgraph/src/mutations/farming/harvest-animal/harvest-animal.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    AnimalCurrentState, 
    getMongooseToken, 
    InventorySchema, 
    InventoryTypeId, 
    PlacedItemSchema, 
    UserSchema,
    InventoryKind,
    SystemId,
    SystemSchema,
    Activities,
    KeyValueRecord,
    PlacedItemTypeId
} from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { HarvestAnimalService } from "./harvest-animal.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("HarvestAnimalService", () => {
    let connection: Connection
    let service: HarvestAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HarvestAnimalService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<HarvestAnimalService>(HarvestAnimalService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully collect animal product and update inventory (not quality)", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume, experiencesGain } = activities.value.harvestAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.Crate
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find an animal in static data
        const animal = staticService.animals[0]
        const quantity = 10

        // Find product for the animal (non-quality) from static data
        const product = staticService.products.find(
            p => p.animal && p.animal.toString() === animal.id.toString() && p.isQuality === false
        )

        // Find inventory type for the product from static data
        const inventoryType = staticService.inventoryTypes.find(
            it => it.product && it.product.toString() === product.id.toString()
        )

        // Create placed item with an animal ready to yield
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: quantity,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Call the service method to harvest the animal
        await service.harvestAnimal(
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

        // Check if inventory was created with the harvested product
        const inventory = await connection
            .model<InventorySchema>(InventorySchema.name)
            .findOne({
                user: user.id,
                inventoryType: inventoryType.id
            })

        expect(inventory).not.toBeNull()
        expect(inventory.quantity).toBe(quantity)

        // Check if the animal's state was updated
        const updatedPlacedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemAnimal.id)

        expect(updatedPlacedItemAnimal.animalInfo.currentState).toBe(AnimalCurrentState.Hungry)
    })

    it("should successfully collect animal product and update inventory (quality)", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume, experiencesGain } = activities.value.harvestAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.Crate
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find an animal in static data
        const animal = staticService.animals[0]
        const quantity = 10

        // Find product for the animal (quality) from static data
        const product = staticService.products.find(
            p => p.animal && p.animal.toString() === animal.id.toString() && p.isQuality === true
        )

        // Find inventory type for the product from static data
        const inventoryType = staticService.inventoryTypes.find(
            it => it.product && it.product.toString() === product.id.toString()
        )

        // Create placed item with an animal ready to yield
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: quantity,
                    isQuality: true
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Call the service method to harvest the animal
        await service.harvestAnimal(
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

        // Check if inventory was created with the harvested product
        const inventory = await connection
            .model<InventorySchema>(InventorySchema.name)
            .findOne({
                user: user.id,
                inventoryType: inventoryType.id
            })

        expect(inventory).not.toBeNull()
        expect(inventory.quantity).toBe(quantity)

        // Check if the animal's state was updated
        const updatedPlacedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemAnimal.id)

        expect(updatedPlacedItemAnimal.animalInfo.currentState).toBe(AnimalCurrentState.Hungry)
    })

    it("should throw GraphQLError with code CRATE_NOT_FOUND_IN_TOOLBAR when crate is not found", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.harvestAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with an animal ready to yield
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.harvestAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CRATE_NOT_FOUND_IN_TOOLBAR")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_FOUND when animal is not found", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.harvestAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.Crate
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemAnimalId = createObjectId()

        try {
            await service.harvestAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: invalidPlacedItemAnimalId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_READY when animal is not ready to yield", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.harvestAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.Crate
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with an animal not ready to yield
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Normal, // Not ready to yield
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.harvestAnimal(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_READY")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.harvestAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.Crate
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find an animal in static data
        const animal = staticService.animals[0]

        // Create placed item with an animal ready to yield
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animal.id,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.harvestAnimal(
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
