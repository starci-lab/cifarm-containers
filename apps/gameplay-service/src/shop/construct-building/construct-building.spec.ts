import {
    BuildingEntity,
    BuildingId,
    PlacedItemEntity,
    UserEntity
} from "@src/databases"
import { MOCK_USER, createTestModule } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest } from "./construct-building.dto"
import { ConstructBuildingService } from "./construct-building.service"
import { ConstructBuildingModule } from "./construct-building.module"

describe("ConstructBuildingService", () => {
    let dataSource: DataSource
    let service: ConstructBuildingService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [ConstructBuildingModule]
        })
        dataSource = ds
        service = module.get<ConstructBuildingService>(ConstructBuildingService)
    })

    it("Should construct a building successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        // Step 1: Create a mock user
        const userBeforeConstruction = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()

        try {
            // Step 2: Get building information
            const building = await queryRunner.manager.findOne(BuildingEntity, {
                where: { id: BuildingId.Pasture, availableInShop: true }
            })

            // Ensure the building exists
            expect(building).toBeDefined()

            // Step 3: Prepare and perform the construct building action
            const constructBuildingRequest: ConstructBuildingRequest = {
                buildingId: building.id,
                userId: userBeforeConstruction.id,
                position: { x: 10, y: 20 }
            }

            await service.constructBuilding(constructBuildingRequest)

            // Step 4: Verify user's golds were updated
            const userAfterConstruction = await queryRunner.manager.findOne(UserEntity, {
                where: { id: userBeforeConstruction.id }
            })

            expect(userAfterConstruction.golds).toBe(
                mockUser.golds - building.price
            )

            // Step 5: Verify placed item was created
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    userId: userBeforeConstruction.id,
                    x: constructBuildingRequest.position.x,
                    y: constructBuildingRequest.position.y
                },
                relations: { buildingInfo: true }
            })

            expect(placedItem).toBeDefined()
            expect(placedItem.buildingInfo.buildingId).toBe(building.id)
            expect(placedItem.buildingInfo.currentUpgrade).toBe(1)
            expect(placedItem.buildingInfo.occupancy).toBe(0)
            expect(placedItem.x).toBe(constructBuildingRequest.position.x)
            expect(placedItem.y).toBe(constructBuildingRequest.position.y)

            await queryRunner.commitTransaction()
        } catch (error) {
            // Rollback transaction in case of error
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
