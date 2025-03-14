// npx jest apps/gameplay-service/src/community/thief-animal-product/thief-animal-product.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    AnimalInfoEntity,
    AnimalCurrentState,
    PlacedItemSchema,
    InventoryEntity,
    UserSchema,
    getPostgreSqlToken,
    ProductType,
    PlacedItemTypeId,
    SystemEntity,
    SystemId,
    Activities,
    InventoryType,
    AnimalId,
    AnimalEntity
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { ThiefAnimalProductService } from "./thief-fruit.service"

describe("ThiefAnimalProductService", () => {
    let dataSource: DataSource
    let service: ThiefAnimalProductService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ThiefAnimalProductService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(ThiefAnimalProductService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully thief animal product and update inventory (no quality)", async () => {
        const animalId = AnimalId.Chicken
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefAnimalProduct: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: animalId }
        })

        // create
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId,
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: animal.maxHarvestQuantity,
                isQuality: false
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: neighborUser.id
        })

        const { quantity: thiefQuantity } = await service.thiefAnimalProduct({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id,
            neighborUserId: neighborUser.id
        })

        const userAfter = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Animal,
                        animalId
                    }
                }
            },
            relations: {
                inventoryType: {
                    product: true
                }
            }
        })

        expect(inventory.quantity).toBeGreaterThanOrEqual(thiefQuantity)
        expect(inventory.inventoryType.product.isQuality).toBe(false)

        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.harvestQuantityRemaining).toBe(animal.maxHarvestQuantity - thiefQuantity)
    })

    it("should successfully thief animal product and update inventory (quality)", async () => {
        const animalId = AnimalId.Chicken
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefAnimalProduct: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: animalId }
        })

        // create
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId,
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: animal.maxHarvestQuantity,
                isQuality: true
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: neighborUser.id
        })

        const { quantity: thiefQuantity } = await service.thiefAnimalProduct({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id,
            neighborUserId: neighborUser.id
        })

        const userAfter = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Animal,
                        animalId
                    }
                }
            },
            relations: {
                inventoryType: {
                    product: true
                }
            }
        })

        expect(inventory.quantity).toBeGreaterThanOrEqual(thiefQuantity)
        expect(inventory.inventoryType.product.isQuality).toBe(true)

        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.harvestQuantityRemaining).toBe(animal.maxHarvestQuantity - thiefQuantity)
    })

    it("should throw GrpcNotFoundException when the animal is not found by its ID", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefAnimalProduct: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()
        const invalidPlacedItemAnimalId = v4()

        await expect(
            service.thiefAnimalProduct({
                userId: user.id,
                placedItemAnimalId: invalidPlacedItemAnimalId,
                neighborUserId: neighborUser.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw EnergyNotEnoughException when user energy is not enough", async () => {
        const animalId = AnimalId.Chicken
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefAnimalProduct: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const neighborUser = await gameplayMockUserService.generate()

        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: animalId }
        })

        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: animal.maxHarvestQuantity
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: neighborUser.id,
        })

        await expect(
            service.thiefAnimalProduct({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id,
                neighborUserId: neighborUser.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    it("should throw GrpcNotFoundException when the animal belongs to yourself", async () => {
        const animalId = AnimalId.Chicken
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefAnimalProduct: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: animalId }
        })

        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId: AnimalId.Chicken,
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: animal.maxHarvestQuantity
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await expect(
            service.thiefAnimalProduct({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id,
                neighborUserId: user.id
            })
        ).rejects.toThrow(GrpcInvalidArgumentException)
    })

    it("should throw GrpcFailedPreconditionException when animal is not ready to yield", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefAnimalProduct: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const animalId = AnimalId.Chicken
        // create
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId,
                currentState: AnimalCurrentState.Normal,
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: neighborUser.id
        })

        await expect(
            service.thiefAnimalProduct({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id,
                neighborUserId: neighborUser.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
