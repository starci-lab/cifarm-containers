import {
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { ClaimDailyRewardRequest } from "./claim-daily-reward.dto"
import { ClaimDailyRewardModule } from "./claim-daily-reward.module"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"

describe("ClaimDailyRewardService", () => {
    let dataSource: DataSource
    let service: ClaimDailyRewardService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [ClaimDailyRewardModule]
        })
        dataSource = ds
        service = module.get<ClaimDailyRewardService>(ClaimDailyRewardService)
    })

    it("the daily reward is claimed", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const user = await queryRunner.manager.save(UserEntity, {
            ...mockUser,
        })

        await queryRunner.startTransaction()

        try {
            const request: ClaimDailyRewardRequest = {
                userId: user.id
            }

            await service.claimDailyReward(request).then(() => {
                expect(true).toBe(true)
            })
        } finally {
            await queryRunner.rollbackTransaction()
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
