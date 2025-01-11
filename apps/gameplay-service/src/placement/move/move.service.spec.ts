import {
    BuildingId,
    PlacedItemEntity,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { MoveRequest } from "./move.dto"
import { MoveService } from "./move.service"
import { MoveModule } from "./move.module"

describe("PlacementMoveService", () => {
    let dataSource: DataSource
    let service: MoveService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [MoveModule]
        })
        dataSource = ds
        service = module.get<MoveService>(MoveService)
    })

    it("should move placement successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        const userBefore = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()

        try {
            // Save initial placed item
            const placedItemBuilding = await queryRunner.manager.save(PlacedItemEntity, {
                userId: userBefore.id,
                x: 0,
                y: 0,
                buildingInfo: {
                    currentUpgrade: 1,
                    buildingId: BuildingId.Pasture,
                    occupancy: 0
                }
            })

            const request: MoveRequest = {
                userId: userBefore.id,
                position: { x: 10, y: 20 },
                placedItemId: placedItemBuilding.id
            }

            await service.move(request)

            // Verify the placement has been moved
            const placedItemBuildingAfterMoving = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: placedItemBuilding.id
                }
            })

            expect(placedItemBuildingAfterMoving.id).toBe(placedItemBuilding.id)
            expect(placedItemBuildingAfterMoving.x).toBe(request.position.x)
            expect(placedItemBuildingAfterMoving.y).toBe(request.position.y)

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
