import { Injectable, Logger } from "@nestjs/common"
import {
    DailyRewardInfo,
    DailyRewardId,
    InjectMongoose,
    SystemId,
    SystemRecord,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, TokenBalanceService } from "@src/gameplay"
import { ClaimDailyRewardRequest, ClaimDailyRewardResponse } from "./claim-daily-reward.dto"
import { createObjectId, DeepPartial, GrpcFailedPreconditionException } from "@src/common"
import { DateUtcService } from "@src/date"
import { Connection } from "mongoose"

@Injectable()
export class ClaimDailyRewardService {
    private readonly logger = new Logger(ClaimDailyRewardService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly dateUtcService: DateUtcService
    ) {}

    async claimDailyReward(request: ClaimDailyRewardRequest): Promise<ClaimDailyRewardResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            // check if spin last time is same as today
            const now = this.dateUtcService.getDayjs()

            if (user.dailyRewardLastClaimTime && now.isSame(user.dailyRewardLastClaimTime, "day")) {
                throw new GrpcFailedPreconditionException("Spin already claimed today")
            }

            const { value } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DailyRewardInfo>>(createObjectId(SystemId.DailyRewardInfo))
                .session(mongoSession)

            const dailyRewardMap: Record<number, DailyRewardId> = {
                0: DailyRewardId.Day1,
                1: DailyRewardId.Day2,
                2: DailyRewardId.Day3,
                3: DailyRewardId.Day4,
                4: DailyRewardId.Day5
            }

            const userChanges: DeepPartial<UserSchema> = {
                dailyRewardLastClaimTime: now.toDate(),
                dailyRewardStreak: user.dailyRewardStreak + 1
            }

            let balanceChanges: DeepPartial<UserSchema> = {}

            // Check streak
            if (user.dailyRewardStreak >= 4) {
                balanceChanges = {
                    ...this.goldBalanceService.add({
                        user,
                        amount: value[DailyRewardId.Day5].golds
                    }),
                    ...this.tokenBalanceService.add({
                        user,
                        amount: value[DailyRewardId.Day5].tokens
                    })
                }
            } else {
                balanceChanges = {
                    ...this.goldBalanceService.add({
                        user,
                        amount: value[dailyRewardMap[user.dailyRewardStreak]].golds
                    })
                }
            }

            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne(
                    { _id: request.userId },
                    {
                        ...userChanges,
                        ...balanceChanges
                    },
                )
                .session(mongoSession)
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
