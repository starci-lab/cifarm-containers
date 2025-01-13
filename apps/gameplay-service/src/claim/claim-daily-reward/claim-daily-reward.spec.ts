import { createTestModule, GameplayMockUserService } from "@src/testing"
import { DataSource } from "typeorm"
import { ClaimDailyRewardRequest } from "./claim-daily-reward.dto"
import { ClaimDailyRewardModule } from "./claim-daily-reward.module"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"

describe("ClaimDailyRewardService", () => {
    let dataSource: DataSource
    let service: ClaimDailyRewardService
    let mockUserService: GameplayMockUserService

    beforeAll(async () => {
        const { module } = await createTestModule({
            imports: [ClaimDailyRewardModule]
        })
        dataSource = module.get<DataSource>(DataSource)
        service = module.get<ClaimDailyRewardService>(ClaimDailyRewardService)
        mockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
    })

    it("the daily reward is claimed", async () => {
        const user = await mockUserService.generate()
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
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
        await mockUserService.clear()
    })
})
