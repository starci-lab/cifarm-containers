// npx jest apps/gameplay-subgraph/src/mutations/community/help-use-bug-net/help-use-bug-net.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    FruitCurrentState, 
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
import { HelpUseBugNetService } from "./help-use-bug-net.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("HelpUseBugNetService", () => {
    let connection: Connection
    let service: HelpUseBugNetService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HelpUseBugNetService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<HelpUseBugNetService>(HelpUseBugNetService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully help use bug net on infested fruit and update user stats", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with an infested fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: createObjectId(),
                    currentState: FruitCurrentState.IsInfested,
                    harvestQuantityRemaining: 5,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create bug net in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.BugNet),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        // Call the service method to help use bug net
        await service.helpUseBugNet(
            { id: user.id },
            {
                placedItemFruitId: placedItemFruit.id
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

        // Check if the fruit's state was updated
        const updatedPlacedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemFruit.id)

        expect(updatedPlacedItemFruit.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
    })

    it("should throw GraphQLError with code BUG_NET_NOT_FOUND when user has no bug net", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with an infested fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: createObjectId(),
                    currentState: FruitCurrentState.IsInfested,
                    harvestQuantityRemaining: 5,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // No bug net is created in the user's inventory

        try {
            await service.helpUseBugNet(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("BUG_NET_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code PLACED_ITEM_FRUIT_NOT_FOUND when fruit is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create bug net in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.BugNet),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        const invalidPlacedItemFruitId = createObjectId()

        try {
            await service.helpUseBugNet(
                { id: user.id },
                {
                    placedItemFruitId: invalidPlacedItemFruitId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_FRUIT_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code CANNOT_HELP_SELF when fruit belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with an infested fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: createObjectId(),
                    currentState: FruitCurrentState.IsInfested,
                    harvestQuantityRemaining: 5,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create bug net in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.BugNet),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseBugNet(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_HELP_SELF")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_INFESTED when fruit is not infested", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a normal fruit (not infested)
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: createObjectId(),
                    currentState: FruitCurrentState.Normal, // Not infested
                    harvestQuantityRemaining: 5,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create bug net in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.BugNet),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseBugNet(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_INFESTED")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_INFESTED when placed item has no fruit info", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with no fruit info
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create bug net in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.BugNet),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseBugNet(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_INFESTED")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with an infested fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: createObjectId(),
                    currentState: FruitCurrentState.IsInfested,
                    harvestQuantityRemaining: 5,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create bug net in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.BugNet),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseBugNet(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
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
