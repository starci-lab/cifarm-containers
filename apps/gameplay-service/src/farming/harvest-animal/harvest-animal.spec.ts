// npx jest apps/gameplay-service/src/farming/harvest-animal/harvest-animal.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { HarvestAnimalService } from "./harvest-animal.service"
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
    AnimalId
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

describe("HarvestAnimalService", () => {
    let dataSource: DataSource
    let service: HarvestAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HarvestAnimalService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(HarvestAnimalService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully collect animal product and update inventory (not quality)", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            harvestAnimal: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const quantity = 10
        const animalId = AnimalId.Chicken
        // create
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId,
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: quantity,
                isQuality: false
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await service.harvestAnimal({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id
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

        expect(inventory.quantity).toBe(quantity)
        expect(inventory.inventoryType.product.isQuality).toBe(false)

        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)
        expect(updatedAnimalInfo.yieldCount).toBe(placedItemAnimal.animalInfo.yieldCount + 1)
    })

    it("should successfully collect animal product and update inventory (quality)", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            harvestAnimal: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const quantity = 10
        const animalId = AnimalId.Chicken
        // create
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId,
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: quantity,
                isQuality: true
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await service.harvestAnimal({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id
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

        expect(inventory.quantity).toBe(quantity)
        expect(inventory.inventoryType.product.isQuality).toBe(true)

        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)
        expect(updatedAnimalInfo.yieldCount).toBe(placedItemAnimal.animalInfo.yieldCount + 1)
    })

    it("should throw GrpcNotFoundException when the animal is not found by its ID", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const invalidPlacedItemAnimalId = v4()

        await expect(
            service.harvestAnimal({
                userId: user.id,
                placedItemAnimalId: invalidPlacedItemAnimalId
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw EnergyNotEnoughException when user energy is not enough", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            harvestAnimal: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                currentState: AnimalCurrentState.Yield
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await expect(
            service.harvestAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    it("should throw GrpcNotFoundException when the animal belongs to a different user", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                animalId: AnimalId.Chicken,
                currentState: AnimalCurrentState.Yield
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await expect(
            service.harvestAnimal({
                userId: v4(),
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when animal is not ready to yield", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

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
            userId: user.id
        })

        await expect(
            service.harvestAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
