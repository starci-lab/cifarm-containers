import {
    BuildingId,
    PlacedItemEntity,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"
import { UpgradeBuildingModule } from "./upgrade-building.module"
import { UpgradeBuildingService } from "./upgrade-building.service"

describe("UpgradeBuildingService", () => {
    let dataSource: DataSource
    let service: UpgradeBuildingService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [UpgradeBuildingModule]
        })
        dataSource = ds
        service = module.get<UpgradeBuildingService>(UpgradeBuildingService)
    })

    it("Should upgrade a building successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const user = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()
        try {
            const placedItem = await queryRunner.manager.save(PlacedItemEntity, {
                userId: user.id,
                buildingInfo: {
                    currentUpgrade: 1,
                    buildingId: BuildingId.Pasture,
                    occupancy: 0,
                },
                x: 0,
                y: 0,
            })

            const request: UpgradeBuildingRequest = {
                placedItemBuildingId: placedItem.id,
                userId: user.id,
            }

            await service.upgradeBuilding(request)

            // Find
            const placedItemBuildingFromDB: DeepPartial<PlacedItemEntity> = await queryRunner.manager.findOne(UpgradeBuildingResponse, {
                where: { placedItemBuildingId: placedItem.id },
            })

            expect(placedItemBuildingFromDB).toBeDefined()
            expect(placedItemBuildingFromDB.id).toBe(placedItem.id)

            const updatedPlacedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: placedItem.id },
            })
            expect(updatedPlacedItem.buildingInfo.currentUpgrade).toBe(2)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, mockUser)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
