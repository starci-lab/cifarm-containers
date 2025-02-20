// npx jest apps/gameplay-service/src/claim/claim-daily-reward/claim-daily-reward.spec.ts

import { Test } from "@nestjs/testing"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { DailyRewardId, DailyRewardInfo, getMongooseToken, SystemId, KeyValueRecord, SystemSchema, UserSchema } from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { DateUtcService } from "@src/date"
import { Connection } from "mongoose"

describe("ClaimDailyRewardService", () => {
    let service: ClaimDailyRewardService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    let dateUtcService: DateUtcService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ClaimDailyRewardService],
        }).compile()

        service = moduleRef.get(ClaimDailyRewardService)
        connection = moduleRef.get(getMongooseToken())
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        dateUtcService = moduleRef.get(DateUtcService)
    })

    it("should successfully claim daily reward for gold case", async () => {
        const user = await gameplayMockUserService.generate({
            dailyRewardLastClaimTime: dateUtcService.getDayjs().subtract(2, "day").toDate(),
            dailyRewardStreak: 1,
        })

        const { value } = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<DailyRewardInfo>>(createObjectId(SystemId.DailyRewardInfo))
        
        await service.claimDailyReward({
            userId: user.id
        })

        const userAfter = await connection.model<UserSchema>(UserSchema.name).findById(user.id)

        expect(userAfter.golds).toEqual(value[DailyRewardId.Day2].golds + user.golds)
        expect(userAfter.dailyRewardStreak).toEqual(user.dailyRewardStreak + 1)
    })

    it("should successfully claim daily reward for last day", async () => {
        const user = await gameplayMockUserService.generate({
            dailyRewardLastClaimTime: dateUtcService.getDayjs().subtract(2, "day").toDate(),
            dailyRewardStreak: 4,
        })

        const { value } = await connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<DailyRewardInfo>>(createObjectId(SystemId.DailyRewardInfo))
        
        await service.claimDailyReward({
            userId: user.id
        })

        const userAfter = await connection.model<UserSchema>(UserSchema.name).findById(user.id)

        expect(userAfter.tokens).toEqual(value[DailyRewardId.Day5].tokens + user.tokens)
        expect(userAfter.golds).toEqual(value[DailyRewardId.Day5].golds + user.golds)
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
