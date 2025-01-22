// npx jest apps/gameplay-service/src/farming/feed-animal/feed-animal.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { FeedAnimalService } from "./feed-animal.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import {
    AnimalInfoEntity,
    AnimalCurrentState,
    PlacedItemEntity,
    UserEntity,
    InventoryEntity,
    SupplyId,
    SystemEntity,
    SystemId,
    Activities,
    getPostgreSqlToken,
    PlacedItemTypeId,
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

describe("FeedAnimalService", () => {
    let dataSource: DataSource
    let service: FeedAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [FeedAnimalService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(FeedAnimalService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully feed the hungry animal and update user stats and inventory", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            collectAnimalProduct: { energyConsume, experiencesGain }
        } = value as Activities
    
        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed animal in hungry state
        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                currentState: AnimalCurrentState.Hungry
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        // Create inventory with animal feed
        const quantity = 10
        const inventory = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            inventoryTypeId: SupplyId.AnimalFeed,
            quantity
        })

        // Call the service method to feed the animal
        await service.feedAnimal({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Assert animal state is updated to normal and hungry time reset
        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)

        // Assert inventory quantity decreased by 1
        const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: { id: inventory.id }
        })

        expect(updatedInventory.quantity).toBe(quantity - 1)
    })

    it("should throw GrpcNotFoundException when animal is not found by its ID", async () => {
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
            service.feedAnimal({
                userId: user.id,
                placedItemAnimalId: invalidPlacedItemAnimalId
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcNotFoundException when animal belongs to a different user", async () => {
        const user = await gameplayMockUserService.generate()
        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                currentState: AnimalCurrentState.Hungry
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Chicken
        })

        await expect(
            service.feedAnimal({
                userId: v4(), // Different user ID
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when animal is not hungry", async () => {
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
                currentState: AnimalCurrentState.Normal // Not hungry
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Chicken
        })

        await expect(
            service.feedAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcNotFoundException when inventory is not found", async () => {
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
                currentState: AnimalCurrentState.Hungry
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Chicken
        })

        await expect(
            service.feedAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
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
                currentState: AnimalCurrentState.Hungry
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })
        
        await expect(
            service.feedAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
