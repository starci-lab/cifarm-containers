// npx jest apps/gameplay-subgraph/src/mutations/community/thief-animal-product/thief-animal-product.spec.ts

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
    InventoryTypeId,
    ProductType
} from "@src/databases"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { Connection } from "mongoose"
import { ThiefAnimalProductService } from "./thief-animal-product.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService, ThiefService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("ThiefAnimalProductService", () => {
    let connection: Connection
    let service: ThiefAnimalProductService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService
    let thiefService: ThiefService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ThiefAnimalProductService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<ThiefAnimalProductService>(ThiefAnimalProductService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        thiefService = module.get<ThiefService>(ThiefService)
    })

    it("should successfully thief animal product and update inventory", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a product in the static service
        const animalId = staticService.animals[0].id
        const product = staticService.products.find(
            (product) =>
                product.type === ProductType.Animal && product.animal.toString() === animalId
        )

        // Find the inventory type for this product
        const inventoryType = staticService.inventoryTypes.find(
            (it) => it.product.toString() === product.id
        )

        // Create placed item with a yielding animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
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

        // Call the service method to thief animal product
        const result = await service.thiefAnimalProduct(
            { id: user.id },
            {
                placedItemAnimalId: placedItemAnimal.id
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

        // Check if the animal's harvest quantity was reduced
        const updatedPlacedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemAnimal.id)

        expect(updatedPlacedItemAnimal.animalInfo.harvestQuantityRemaining).toBe(7) // 10 - 3
        expect(
            updatedPlacedItemAnimal.animalInfo.thieves.map((theive) => theive.toString())
        ).toContainEqual(user.id)

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
        const { energyConsume } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a product in the static service
        const animalId = staticService.animals[0].id

        // Create placed item with a yielding animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })

        // No crate is created in the user's inventory

        try {
            await service.thiefAnimalProduct(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CRATE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_FOUND when animal is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefAnimalProduct

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

        const invalidPlacedItemAnimalId = createObjectId()

        try {
            await service.thiefAnimalProduct(
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

    it("should throw GraphQLError with code UNAUTHORIZED_THIEF when animal belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a product in the static service
        const animalId = staticService.animals[0].id

        // Create placed item with a yielding animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
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
            await service.thiefAnimalProduct(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("UNAUTHORIZED_THIEF")
        }
    })

    it("should throw GraphQLError with code ANIMAL_NOT_YIELDING when animal is not yielding", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a product in the static service
        const animalId = staticService.animals[0].id

        // Create placed item with a non-yielding animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Normal, // Not yielding
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
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
            await service.thiefAnimalProduct(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ANIMAL_NOT_YIELDING")
        }
    })

    it("should throw GraphQLError with code ALREADY_THIEF when user already thief from this animal", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a product in the static service
        const animalId = staticService.animals[0].id

        // Create placed item with a yielding animal that user already thief from
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: [user.id] // User already in thieves list
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
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
            await service.thiefAnimalProduct(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
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
        const { energyConsume } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a product in the static service
        const animalId = staticService.animals[0].id

        // Create placed item with a yielding animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
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
            await service.thiefAnimalProduct(
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

    it("should throw GraphQLError with code THIEF_QUANTITY_LESS_THAN_MINIMUM_YIELD_QUANTITY when computed quantity is 0", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefAnimalProduct

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a product in the static service
        const animalId = staticService.animals[0].id

        // Create placed item with a yielding animal
        const placedItemAnimal = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                animalInfo: {
                    animal: animalId,
                    currentState: AnimalCurrentState.Yield,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
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
            await service.thiefAnimalProduct(
                { id: user.id },
                {
                    placedItemAnimalId: placedItemAnimal.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("THIEF_QUANTITY_LESS_THAN_MINIMUM_YIELD_QUANTITY")
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
