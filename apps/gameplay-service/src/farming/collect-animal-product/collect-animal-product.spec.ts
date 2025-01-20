// npx jest apps/gameplay-service/src/farming/collect-animal-product/collect-animal-product.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { CollectAnimalProductService } from "./collect-animal-product.service"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    AnimalInfoEntity,
    AnimalCurrentState,
    PlacedItemEntity,
    InventoryEntity,
    UserEntity,
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

describe("CollectAnimalProductService", () => {
    let dataSource: DataSource
    let service: CollectAnimalProductService
    let connectionService: ConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [CollectAnimalProductService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(CollectAnimalProductService)
        connectionService = moduleRef.get(ConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully collect animal product and update inventory", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            collectAnimalProduct: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const quantity = 10
        const animalId = AnimalId.Chicken
        // create
        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                animalId,
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: quantity
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await service.collectAnimalProduct({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
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
            }
        })

        expect(inventory.quantity).toBe(quantity)

        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)
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
            service.collectAnimalProduct({
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
            collectAnimalProduct: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                currentState: AnimalCurrentState.Yield
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        await expect(
            service.collectAnimalProduct({
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

        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
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
            service.collectAnimalProduct({
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
        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
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
            service.collectAnimalProduct({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
