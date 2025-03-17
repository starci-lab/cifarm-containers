// npx jest apps/gameplay-subgraph/src/mutations/farming/use-bug-net/use-bug-net.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { UseBugNetService } from "./use-bug-net.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { EnergyNotEnoughException, LevelService, StaticService } from "@src/gameplay"
import {
    getMongooseToken,
    PlacedItemSchema,
    InventorySchema,
    UserSchema,
    FruitCurrentState,
    InventoryTypeId,
    PlacedItemTypeId,
    InventoryKind,
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"

describe("UseBugNetService", () => {
    let service: UseBugNetService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseBugNetService]
        }).compile()
        
        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<UseBugNetService>(UseBugNetService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully use bug net and update fruit state, energy, and experience", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.useBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create bug net inventory for the user
        const bugNetInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.BugNet
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: bugNetInventoryType.id,
            index: 1,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Tool
        })

        // Create a fruit with infested state
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile),
                fruitInfo: {
                    currentState: FruitCurrentState.IsInfested,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                }
            })

        // Call the service method to use bug net
        await service.useBugNet(
            {
                id: user.id
            },
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

        // Get the updated placedItemFruit
        const updatedPlacedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemFruit.id)

        // Check if the fruit state was updated to normal
        expect(updatedPlacedItemFruit.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
    })

    it("should throw GraphQLError with code BUG_NET_NOT_FOUND when user doesn't have a bug net", async () => {
        const { energyConsume } = staticService.activities.useBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create a fruit with infested state
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile),
                fruitInfo: {
                    currentState: FruitCurrentState.IsInfested,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                }
            })

        try {
            await service.useBugNet(
                {
                    id: user.id
                },
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

    it("should throw GraphQLError with code FRUIT_NOT_FOUND when fruit is not found", async () => {
        const { energyConsume } = staticService.activities.useBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create bug net inventory for the user
        const bugNetInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.BugNet
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: bugNetInventoryType.id,
            index: 1,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Tool
        })

        const invalidPlacedItemFruitId = createObjectId()

        try {
            await service.useBugNet(
                {
                    id: user.id
                },
                {
                    placedItemFruitId: invalidPlacedItemFruitId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_PLANTED when fruit info doesn't exist", async () => {
        const { energyConsume } = staticService.activities.useBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create bug net inventory for the user
        const bugNetInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.BugNet
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: bugNetInventoryType.id,
            index: 1,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Tool
        })  

        // Create a placed item without fruit info
        const placedItemWithoutFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useBugNet(
                {
                    id: user.id
                },
                {
                    placedItemFruitId: placedItemWithoutFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_PLANTED")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_INFESTED when fruit is not infested", async () => {
        const { energyConsume } = staticService.activities.useBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create bug net inventory for the user
        const bugNetInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.BugNet
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: bugNetInventoryType.id,
            index: 1,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Tool
        })

        // Create a fruit with normal state (not infested)
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile),
                fruitInfo: {
                    currentState: FruitCurrentState.Normal, // Not infested
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                }
            })

        try {
            await service.useBugNet(
                {
                    id: user.id
                },
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
        const { energyConsume } = staticService.activities.useBugNet

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create bug net inventory for the user
        const bugNetInventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.BugNet
        )
        
        await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: bugNetInventoryType.id,
            index: 1,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Tool
        })

        // Create a fruit with infested state
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile),
                fruitInfo: {
                    currentState: FruitCurrentState.IsInfested,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                }
            })

        try {
            await service.useBugNet(
                {
                    id: user.id
                },
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
