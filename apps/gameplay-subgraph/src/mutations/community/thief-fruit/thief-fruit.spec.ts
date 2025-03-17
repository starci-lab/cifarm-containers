// npx jest apps/gameplay-subgraph/src/mutations/community/thief-fruit/thief-fruit.spec.ts

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
    InventoryTypeId,
    ProductType
} from "@src/databases"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { Connection } from "mongoose"
import { ThiefFruitService } from "./thief-fruit.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService, ThiefService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("ThiefFruitService", () => {
    let connection: Connection
    let service: ThiefFruitService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService
    let thiefService: ThiefService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ThiefFruitService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<ThiefFruitService>(ThiefFruitService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        thiefService = module.get<ThiefService>(ThiefService)
    })

    it("should successfully thief fruit and update inventory", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        // Mock the thiefService.compute method to return a predictable value
        jest.spyOn(thiefService, "compute").mockReturnValueOnce({ value: 3 })

        // Call the service method to thief fruit
        const result = await service.thiefFruit(
            { id: user.id },
            {
                placedItemFruitId: placedItemFruit.id
            }
        )

        // Check the result
        expect(result.quantity).toBe(3)

        // Check user energy and experience changes
        const userAfter = await connection
            .model<UserSchema>(UserSchema.name)
            .findById(user.id)
            .select("energy level experiences")

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Check if the fruit's harvest quantity was reduced
        const updatedPlacedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemFruit.id)

        expect(updatedPlacedItemFruit.fruitInfo.harvestQuantityRemaining).toBe(7) // 10 - 3
        expect(
            updatedPlacedItemFruit.fruitInfo.thieves.map((thief) => thief.toString())
        ).toContainEqual(user.id)

        // Find the product and inventory type for this fruit
        const product = staticService.products.find(
            (product) =>
                product.type === ProductType.Fruit && product.fruit.toString() === fruitId.toString()
        )
        const inventoryType = staticService.inventoryTypes.find(
            (it) => it.product.toString() === product.id
        )

        // Check if the product was added to the user's inventory
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: inventoryType.id
        })

        expect(inventory).toBeTruthy()
        expect(inventory.quantity).toBe(3)
    })

    it("should throw GraphQLError with code CRATE_NOT_FOUND when user has no crate", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // No crate is created in the user's inventory

        try {
            await service.thiefFruit(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CRATE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_FOUND when fruit is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        const invalidPlacedItemFruitId = createObjectId()

        try {
            await service.thiefFruit(
                { id: user.id },
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

    it("should throw GraphQLError with code UNAUTHORIZED_THIEF when fruit belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefFruit(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("UNAUTHORIZED_THIEF")
        }
    })

    it("should throw GraphQLError with code FRUIT_NOT_MATURED when fruit is not fully matured", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a non-fully matured fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.Normal, // Not fully matured
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefFruit(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FRUIT_NOT_MATURED")
        }
    })

    it("should throw GraphQLError with code ALREADY_THIEF when user already thief from this fruit", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a fully matured fruit that user already thief from
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: [user.id] // User already in thieves list
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefFruit(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ALREADY_THIEF")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefFruit(
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

    it("should throw GraphQLError with code THIEF_QUANTITY_LESS_THAN_MINIMUM_YIELD_QUANTITY when computed quantity is 0", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a fruit in the static service
        const fruitId = staticService.fruits[0].id

        // Create placed item with a fully matured fruit
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: fruitId,
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        // Mock the thiefService.compute method to return 0
        jest.spyOn(thiefService, "compute").mockReturnValueOnce({ value: 0 })

        try {
            await service.thiefFruit(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("THIEF_QUANTITY_LESS_THAN_MINIMUM_YIELD_QUANTITY")
        }
    })

    it("should throw GraphQLError with code PRODUCT_NOT_FOUND when product is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefFruit

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create a non-existent fruit ID
        const nonExistentFruitId = createObjectId()

        // Create placed item with a fully matured fruit but with non-existent fruit ID
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    fruit: nonExistentFruitId, // Non-existent fruit ID
                    currentState: FruitCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Apple)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        // Mock the thiefService.compute method to return a predictable value
        jest.spyOn(thiefService, "compute").mockReturnValueOnce({ value: 3 })

        try {
            await service.thiefFruit(
                { id: user.id },
                {
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PRODUCT_NOT_FOUND")
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
