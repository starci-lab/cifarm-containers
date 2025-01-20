// npx jest apps/gameplay-service/src/shop/buy-animal/buy-animal.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { BuyAnimalService } from "./buy-animal.service"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    AnimalEntity,
    AnimalId,
    BuildingId,
    getPostgreSqlToken,
    PlacedItemEntity,
    PlacedItemTypeId,
    UpgradeEntity,
    UserEntity
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UserInsufficientGoldException } from "@src/gameplay"
import { GrpcFailedPreconditionException } from "@src/common"
import { v4 } from "uuid"

describe("BuyAnimalService", () => {
    let dataSource: DataSource
    let service: BuyAnimalService
    let connectionService: ConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyAnimalService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(BuyAnimalService)
        connectionService = moduleRef.get(ConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy an animal and update user and placed item", async () => {
        const x = 0, y = 0
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: AnimalId.Chicken }
        })
        const user = await gameplayMockUserService.generate({ golds: animal.price + 10 })

        //create placed item building by data source
        const building = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Coop,
            x,
            y,
            buildingInfo: { }
        })

        const totalCost = animal.price

        const golds = user.golds

        await service.buyAnimal({
            userId: user.id,
            animalId: animal.id,
            placedItemBuildingId: building.id,
            position: { x, y }
        })

        const { golds: goldsAfter } = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["golds"]
        })

        expect(golds - goldsAfter).toBe(totalCost)

        const placedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                userId: user.id,
                placedItemType: {
                    animalId: animal.id
                }
            },
        })

        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(x)
        expect(placedItem.y).toBe(y)
    })

    it("should throw GrpcNotFoundException when animal is not found", async () => {
        const user = await gameplayMockUserService.generate()
        const invalidAnimalId = "invalid_animal_id" as AnimalId

        const building = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Coop,
            x: 0,
            y: 0,
            buildingInfo: {}
        })

        await expect(
            service.buyAnimal({
                userId: user.id,
                animalId: invalidAnimalId,
                placedItemBuildingId: building.id,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcNotFoundException when building is not found", async () => {
        const user = await gameplayMockUserService.generate()
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: AnimalId.Cow }
        })

        const invalidBuildingId = v4()

        await expect(
            service.buyAnimal({
                userId: user.id,
                animalId: animal.id,
                placedItemBuildingId: invalidBuildingId,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when placed item is not a building", async () => {
        const user = await gameplayMockUserService.generate()
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: AnimalId.Cow }
        })

        const nonBuildingPlacedItem = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Chicken,
            x: 0,
            y: 0
        })

        await expect(
            service.buyAnimal({
                userId: user.id,
                animalId: animal.id,
                placedItemBuildingId: nonBuildingPlacedItem.id,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcFailedPreconditionException when building is full", async () => {
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: AnimalId.Chicken }
        })
        const user = await gameplayMockUserService.generate({ golds: animal.price + 10 })

        //take the lowest upgrade level of the building
        const upgrade = await dataSource.manager.findOne(UpgradeEntity, {
            where: { buildingId: BuildingId.Coop, upgradeLevel: 0 }
        })

        //create placed item building by data source, with occupancy equal to capacity
        const building = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Coop,
            x: 0,
            y: 1,
            buildingInfo: {},
            placedItems: Array.from({ length: upgrade.capacity }, (_, i) => ({
                userId: user.id,
                x: i,
                y: 0,
                animalInfo: {},
                placedItemTypeId: PlacedItemTypeId.Chicken
            }))
        })

        await expect(
            service.buyAnimal({
                userId: user.id,
                animalId: animal.id,
                placedItemBuildingId: building.id,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: { id: AnimalId.Chicken }
        })
        // generate user with golds less than animal price
        const user = await gameplayMockUserService.generate({ golds: animal.price - 10 })

        //create placed item building by data source
        const building = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.Coop,
            x: 10,
            y: 10,
            buildingInfo: {}
        })

        await expect(
            service.buyAnimal({
                userId: user.id,
                animalId: animal.id,
                placedItemBuildingId: building.id,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
