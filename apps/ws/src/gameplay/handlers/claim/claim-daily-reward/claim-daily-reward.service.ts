import { Injectable, Logger } from "@nestjs/common"
import { DailyRewardId, InjectMongoose, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { DateUtcService } from "@src/date"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { SyncService } from "@src/gameplay"
import { WithStatus } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class ClaimDailyRewardService {
    private readonly logger = new Logger(ClaimDailyRewardService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
    ) {}

    async claimDailyReward({ id: userId }: UserLike): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        let syncedUser: WithStatus<UserSchema> | undefined
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
                if (!user) {
                    throw new WsException("User not found")
                }
                const userSnapshot = user.$clone()

                /************************************************************
                 * CHECK DAILY REWARD ELIGIBILITY
                 ************************************************************/
                // Check if spin last time is the same as today
                const now = this.dateUtcService.getDayjs()

                if (
                    user.dailyRewardLastClaimTime &&
                    now.isSame(user.dailyRewardLastClaimTime, "day")
                ) {
                    throw new WsException("Daily reward already claimed today")
                }

                /************************************************************
                 * DETERMINE REWARD BASED ON STREAK
                 ************************************************************/
                const { dailyRewardInfo } = this.staticService

                const dailyRewardMap: Record<number, DailyRewardId> = {
                    0: DailyRewardId.Day1,
                    1: DailyRewardId.Day2,
                    2: DailyRewardId.Day3,
                    3: DailyRewardId.Day4,
                    4: DailyRewardId.Day5
                }

                user.dailyRewardLastClaimTime = now.toDate()
                user.dailyRewardStreak += 1

                /************************************************************
                 * APPLY REWARDS BASED ON STREAK
                 ************************************************************/
                // Check streak
                if (user.dailyRewardStreak >= 4) {
                    // Day 5 reward (gold)
                    this.goldBalanceService.add({
                        user,
                        amount: dailyRewardInfo[DailyRewardId.Day5].golds
                    })
                } else {
                    // Day 1-4 rewards (gold only)
                    this.goldBalanceService.add({
                        user,
                        amount: dailyRewardInfo[dailyRewardMap[user.dailyRewardStreak]].golds
                    })
                }

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update the user with the changes
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
            })

            return {
                user: syncedUser
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
