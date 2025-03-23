// npx jest apps/gameplay-subgraph/src/mutations/farming/feed-animal/feed-animal.spec.ts

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
    InventoryType,
    SystemId,
    SystemSchema,
    Activities,
    KeyValueRecord,
    PlacedItemTypeId
} from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { FeedAnimalService } from "./use-animal-feed.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("FeedAnimalService", () => {
    let connection: Connection
    let service: FeedAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [FeedAnimalService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<FeedAnimalService>(FeedAnimalService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully feed an animal and update user and inventory", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume, experiencesGain } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal feed inventory
        const animalFeedType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalFeed
        )

        // Create inventory with animal feed
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalFeedType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a hungry animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // Call the service method to feed the animal
        await service.feedAnimal(
            { id: user.id },
            {
                inventorySupplyId: inventory.id,
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

        // Check if inventory was updated (feed was consumed)
        const inventoryAfter = await connection
            .model<InventorySchema>(InventorySchema.name)
            .findById(inventory.id)

        expect(inventoryAfter.quantity).toBe(4)

        // Check if the animal's state was updated
        const updatedPlacedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemAnimal.id)

        expect(updatedPlacedItemAnimal.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
    })

    it("should throw GraphQLError with code PLACED_ITEM_ANIMAL_NOT_FOUND when animal is not found", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal feed inventory
        const animalFeedType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalFeed
        )

        // Create inventory with animal feed
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalFeedType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemAnimalId = createObjectId()

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemAnimalId: invalidPlacedItemAnimalId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_ANIMAL_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code CANNOT_FEED_OTHERS_ANIMAL when animal belongs to another user", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal feed inventory
        const animalFeedType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalFeed
        )

        // Create inventory with animal feed
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalFeedType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a hungry animal owned by another user
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_FEED_OTHERS_ANIMAL")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_HUNGRY when animal is not hungry", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create animal feed inventory
        const animalFeedType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalFeed
        )

        // Create inventory with animal feed
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalFeedType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a non-hungry animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Normal // Not hungry
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_HUNGRY")
        }
    })

    it("should throw GraphQLError with code INVENTORY_NOT_FOUND when inventory is not found", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a hungry animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        const invalidInventoryId = createObjectId()

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: invalidInventoryId,
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVENTORY_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code INVALID_INVENTORY_TYPE when inventory type is not a supply", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a non-supply inventory type
        const nonSupplyType = staticService.inventoryTypes.find(
            type => type.type !== InventoryType.Supply
        )

        // Create inventory with invalid type
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: nonSupplyType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a hungry animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVALID_INVENTORY_TYPE")
        }
    })

    it("should throw GraphQLError with code INVALID_SUPPLY_TYPE when inventory is not animal feed", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a supply inventory type that is not animal feed
        const wrongSupplyType = staticService.inventoryTypes.find(
            type => type.type === InventoryType.Supply && type.displayId !== InventoryTypeId.AnimalFeed
        )

        // Create inventory with wrong supply type
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: wrongSupplyType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a hungry animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVALID_SUPPLY_TYPE")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const activities = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        
        const { energyConsume } = activities.value.feedAnimal

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create animal feed inventory
        const animalFeedType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.AnimalFeed
        )

        // Create inventory with animal feed
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: animalFeedType.id,
            quantity: 5,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a hungry animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        try {
            await service.feedAnimal(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
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
