// npx jest apps/gameplay-service/src/community/help-cure-animal/help-cure-animal.spec.ts

import { Test } from "@nestjs/testing"
import { HelpCureAnimalService } from "./help-feed-animal.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    AnimalInfoEntity,
    AnimalCurrentState,
    PlacedItemSchema,
    UserSchema,
    SystemEntity,
    SystemId,
    Activities,
    getPostgreSqlToken,
    PlacedItemTypeId,
    AnimalId
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

describe("HelpCureAnimalService", () => {
    let dataSource: DataSource
    let service: HelpCureAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HelpCureAnimalService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(HelpCureAnimalService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully help cure the sick animal and update user stats", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()
    
        // create placed animal in sick state
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                currentState: AnimalCurrentState.Sick
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: neighborUser.id
        })

        // Call the service method to cure the animal
        await service.helpCureAnimal({
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
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const invalidPlacedItemAnimalId = v4()

        await expect(
            service.helpCureAnimal({
                userId: user.id,
                placedItemAnimalId: invalidPlacedItemAnimalId,
                neighborUserId: neighborUser.id
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
        const neighborUser = await gameplayMockUserService.generate()
    
        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                currentState: AnimalCurrentState.Sick
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            userId: neighborUser.id
        })
    
        await expect(
            service.helpCureAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id,
                neighborUserId: neighborUser.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    it("should throw GrpcNotFoundException when animal belongs to yourself", async () => {
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
                currentState: AnimalCurrentState.Sick
            },
            x: 0,
            y: 0,
            userId: user.id
        })

        await expect(
            service.helpCureAnimal({
                userId: user.id,
                placedItemAnimalId: placedItemAnimal.id,
                neighborUserId: user.id
            })
        ).rejects.toThrow(GrpcInvalidArgumentException)
    })

    it("should throw GrpcFailedPreconditionException when animal is not sick", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const placedItemAnimal = await dataSource.manager.save(PlacedItemSchema, {
            animalInfo: {
                currentState: AnimalCurrentState.Normal // Not sick
            },
            x: 0,
            y: 0,
            userId: neighborUser.id,
            placedItemTypeId: PlacedItemTypeId.Chicken
        })

        await expect(
            service.helpCureAnimal({
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
