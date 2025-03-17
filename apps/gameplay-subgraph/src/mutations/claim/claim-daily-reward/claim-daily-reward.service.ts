import { Injectable, Logger } from "@nestjs/common"
import {
    DailyRewardId,
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService, TokenBalanceService } from "@src/gameplay"
import {  DeepPartial } from "@src/common"
import { DateUtcService } from "@src/date"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class ClaimDailyRewardService {
    private readonly logger = new Logger(ClaimDailyRewardService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService
    ) {}

    async claimDailyReward({ id: userId }: UserLike): Promise<void> {
        const mongoSession = await this.connection.startSession()

        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check if spin last time is the same as today
                const now = this.dateUtcService.getDayjs()

                if (
                    user.dailyRewardLastClaimTime &&
                    now.isSame(user.dailyRewardLastClaimTime, "day")
                ) {
                    throw new GraphQLError(
                        "Daily reward already claimed today",
                        {
                            extensions: {
                                code: "DAILY_REWARD_ALREADY_CLAIMED_TODAY"
                            }
                        }
                    )
                }

                const { dailyRewardInfo } = this.staticService

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
                            amount: dailyRewardInfo[DailyRewardId.Day5].golds
                        }),
                        ...this.tokenBalanceService.add({
                            user,
                            amount: dailyRewardInfo[DailyRewardId.Day5].tokens
                        })
                    }
                } else {
                    balanceChanges = {
                        ...this.goldBalanceService.add({
                            user,
                            amount: dailyRewardInfo[dailyRewardMap[user.dailyRewardStreak]].golds
                        })
                    }
                }

                // Update the user with the changes
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: userId },
                        {
                            ...userChanges,
                            ...balanceChanges
                        }
                    )
                    .session(mongoSession)
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
