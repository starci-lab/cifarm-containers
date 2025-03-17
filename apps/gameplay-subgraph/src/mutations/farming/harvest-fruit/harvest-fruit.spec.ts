// npx jest apps/gameplay-subgraph/src/mutations/farming/harvest-fruit/harvest-fruit.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { HarvestFruitService } from "./harvest-fruit.service"
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
    FruitCurrentState,
    FruitId,
    PlacedItemTypeId,
    InventoryType
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"
import { EnergyNotEnoughException, LevelService, StaticService } from "@src/gameplay"

describe("HarvestFruitService", () => {
    let service: HarvestFruitService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HarvestFruitService]
        }).compile()
        
        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<HarvestFruitService>(HarvestFruitService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully harvest a fruit and update the user's stats and inventory accordingly", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.harvestFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const fruitId = FruitId.Apple
        const fruit = staticService.fruits.find(f => f.displayId === fruitId)
        const quantity = 10
        const isQuality = false
        const initialHarvestCount = 0

        // Find the product for this fruit
        const product = staticService.products.find(p => 
            p.fruit && p.fruit.toString() === fruit.id.toString() && p.isQuality === isQuality
        )

        // Find the inventory type for this product
        const inventoryType = staticService.inventoryTypes.find(it => 
            it.type === InventoryType.Product && 
            it.product && 
            it.product.toString() === product.id.toString()
        )

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            fruitInfo: {
                fruit: fruit.id,
                currentState: FruitCurrentState.FullyMatured,
                harvestQuantityRemaining: quantity,
                isQuality,
                harvestCount: initialHarvestCount,
                currentStage: fruit.growthStages - 1, // Fully matured stage
                currentStageTimeElapsed: fruit.growthStageDuration // Completed time
            },
            x: 0,
            y: 0,
            user: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })

        // Call the service method to harvest the fruit
        const result = await service.harvestFruit(
            { id: user.id },
            { placedItemFruitId: placedItemFruit.id }
        )

        // Check the result
        expect(result).toEqual({ quantity })

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

        // Assert inventory has been created with the harvested fruit
        const inventory = await connection
            .model<InventorySchema>(InventorySchema.name)
            .findOne({
                user: user.id,
                inventoryType: inventoryType.id
            })

        expect(inventory).not.toBeNull()
        expect(inventory.quantity).toBe(quantity)

        // Get the updated placedItemFruit
        const updatedPlacedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemFruit.id)

        // Check if the fruit info is updated correctly based on the ProductService.updateFruitInfoAfterHarvest implementation
        expect(updatedPlacedItemFruit.fruitInfo).not.toBeNull()
        expect(updatedPlacedItemFruit.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
        expect(updatedPlacedItemFruit.fruitInfo.harvestQuantityRemaining).toBe(0)
        expect(updatedPlacedItemFruit.fruitInfo.timesHarvested).toBe(initialHarvestCount + 1)
        expect(updatedPlacedItemFruit.fruitInfo.currentStage).toBe(fruit.nextGrowthStageAfterHarvest)
        expect(updatedPlacedItemFruit.fruitInfo.currentStageTimeElapsed).toBe(0)
    })

    it("should throw GraphQLError with code FRUIT_NOT_FOUND when fruit is not found", async () => {
        const { energyConsume } = staticService.activities.harvestFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const invalidPlacedItemFruitId = createObjectId()

        try {
            await service.harvestFruit(
                { id: user.id },
                { placedItemFruitId: invalidPlacedItemFruitId }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_PLANTED when fruit is not planted", async () => {
        const { energyConsume } = staticService.activities.harvestFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item without fruit info
        const placedItemFruit = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            fruitInfo: null, // No fruit planted
            x: 0,
            y: 0,
            user: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })

        try {
            await service.harvestFruit(
                { id: user.id },
                { placedItemFruitId: placedItemFruit.id }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_PLANTED")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_FULLY_MATURED when fruit is not fully matured", async () => {
        const { energyConsume } = staticService.activities.harvestFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const fruitId = FruitId.Apple
        const fruit = staticService.fruits.find(f => f.displayId === fruitId)

        // Create placed item with a fruit that is not fully matured
        const placedItemFruit = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            fruitInfo: {
                fruit: fruit.id,
                currentState: FruitCurrentState.Normal, // Not fully matured
                harvestQuantityRemaining: 10,
                isQuality: false
            },
            x: 0,
            y: 0,
            user: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })

        try {
            await service.harvestFruit(
                { id: user.id },
                { placedItemFruitId: placedItemFruit.id }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_FULLY_MATURED")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.harvestFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        const fruitId = FruitId.Apple
        const fruit = staticService.fruits.find(f => f.displayId === fruitId)

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            fruitInfo: {
                fruit: fruit.id,
                currentState: FruitCurrentState.FullyMatured,
                harvestQuantityRemaining: 10,
                isQuality: false
            },
            x: 0,
            y: 0,
            user: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })

        try {
            await service.harvestFruit(
                { id: user.id },
                { placedItemFruitId: placedItemFruit.id }
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
