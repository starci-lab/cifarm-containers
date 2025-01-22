// npx jest apps/gameplay-service/src/farming/cure-animal/cure-animal.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { CureAnimalService } from "./cure-animal.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    AnimalInfoEntity,
    AnimalCurrentState,
    PlacedItemEntity,
    UserEntity,
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

describe("CureAnimalService", () => {
    let dataSource: DataSource
    let service: CureAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [CureAnimalService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(CureAnimalService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully cure the sick animal and update user stats", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            cureAnimal: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
    
        // create placed animal in sick state
        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                currentState: AnimalCurrentState.Sick
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })

        // Call the service method to cure the animal
        await service.cureAnimal({
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

        const updatedAnimalInfo = await dataSource.manager.findOne(AnimalInfoEntity, {
            where: { id: placedItemAnimal.animalInfoId }
        })

        expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)
    })

    it("should throw GrpcNotFoundException when animal is not found by its ID", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            cureAnimal: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const invalidPlacedItemAnimalId = v4()

        await expect(
            service.cureAnimal({
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
                currentState: AnimalCurrentState.Sick
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: user.id
        })
    
        await expect(
            service.cureAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    it("should throw GrpcNotFoundException when animal belongs to a different user", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            cureAnimal: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                animalId: v4(),
                currentState: AnimalCurrentState.Sick
            },
            x: 0,
            y: 0,
            userId: user.id
        })

        await expect(
            service.cureAnimal({
                userId: v4(), // different user ID
                placedItemAnimalId: placedItemAnimal.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when animal is not sick", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            cureAnimal: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const placedItemAnimal = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                currentState: AnimalCurrentState.Normal // Not sick
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Chicken
        })

        await expect(
            service.cureAnimal({
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
