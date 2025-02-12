// npx jest apps/gameplay-service/src/claim/claim-daily-reward/claim-daily-reward.spec.ts

import { Test } from "@nestjs/testing"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { DataSource } from "typeorm"
import { DailyRewardEntity, DailyRewardId, getPostgreSqlToken, UserSchema } from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { GrpcFailedPreconditionException } from "@src/common"
import { DateUtcService } from "@src/date"

describe("ClaimDailyRewardService", () => {
    let service: ClaimDailyRewardService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    let dateUtcService: DateUtcService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ClaimDailyRewardService],
        }).compile()

        service = moduleRef.get(ClaimDailyRewardService)
        dataSource = moduleRef.get(getPostgreSqlToken())
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        dateUtcService = moduleRef.get(DateUtcService)
    })

    it("should successfully claim daily reward for gold case", async () => {
        const user = await gameplayMockUserService.generate({
            dailyRewardLastClaimTime: dateUtcService.getDayjs().subtract(2, "day").toDate(),
            dailyRewardStreak: 1,
        })

        const dailyReward = await dataSource.manager.findOne(DailyRewardEntity, {
            where: { id: DailyRewardId.Day2 }
        })
        
        await service.claimDailyReward({
            userId: user.id
        })

        const userAfter = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id }
        })

        expect(userAfter.golds).toEqual(dailyReward.golds + user.golds)
        expect(userAfter.dailyRewardStreak).toEqual(user.dailyRewardStreak + 1)
    })

    it("should successfully claim daily reward for last day", async () => {
        const user = await gameplayMockUserService.generate({
            dailyRewardLastClaimTime: dateUtcService.getDayjs().subtract(2, "day").toDate(),
            dailyRewardStreak: 4,
        })

        const dailyReward = await dataSource.manager.findOne(DailyRewardEntity, {
            where: { id: DailyRewardId.Day5 },
        })
        
        await service.claimDailyReward({
            userId: user.id
        })

        const userAfter = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id }
        })

        expect(userAfter.tokens).toEqual(dailyReward.tokens + user.tokens)
        expect(userAfter.golds).toEqual(dailyReward.golds + user.golds)
        expect(userAfter.dailyRewardStreak).toEqual(user.dailyRewardStreak + 1)
    })

    it("should throw GrpcFailedPreconditionException if user already claimed today", async () => {
        const user = await gameplayMockUserService.generate({
            dailyRewardLastClaimTime: dateUtcService.getDayjs().toDate(),
        })

        await expect(
            service.claimDailyReward({
                userId: user.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
