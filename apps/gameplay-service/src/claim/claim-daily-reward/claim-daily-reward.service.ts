import { Injectable, Logger } from "@nestjs/common"
import { DailyRewardEntity, InjectPostgreSQL, UserEntity } from "@src/databases"
import { GoldBalanceService, TokenBalanceService } from "@src/gameplay"
import dayjs from "dayjs"
import { DataSource, DeepPartial } from "typeorm"
import { ClaimDailyRewardRequest, ClaimDailyRewardResponse } from "./claim-daily-reward.dto"
import { GrpcInternalException, GrpcPermissionDeniedException } from "nestjs-grpc-exceptions"

@Injectable()
export class ClaimDailyRewardService {
    private readonly logger = new Logger(ClaimDailyRewardService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService
    ) {}

    async claimDailyReward(request: ClaimDailyRewardRequest): Promise<ClaimDailyRewardResponse> {
        this.logger.debug(`Starting claim daily reward for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Get latest claim time
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // check if spin last time is same as today
            if (user.spinLastTime && dayjs(user.spinLastTime).isSame()) {
                throw new GrpcPermissionDeniedException("Spin already claimed today")
            }

            const dailyRewards = await queryRunner.manager.find(DailyRewardEntity, {
                order: {
                    day: "ASC"
                }
            })

            //check if daily rewards not equal to 5
            if (dailyRewards.length !== 5) {
                throw new GrpcInternalException("Daily rewards not equal to 5")
            }

            // Update user's daily reward
            const now = dayjs()
            const userChanges: DeepPartial<UserEntity> = {
                dailyRewardLastClaimTime: now.toDate(),
                dailyRewardStreak: user.dailyRewardStreak + 1
            }

            let balanceChanges: DeepPartial<UserEntity> = {}

            // Check streak
            if (user.dailyRewardStreak >= 4) {
                balanceChanges = {
                    ...this.goldBalanceService.add({
                        entity: user,
                        amount: dailyRewards[4].golds
                    }),
                    ...this.tokenBalanceService.add({
                        entity: user,
                        amount: dailyRewards[4].tokens
                    })
                }
            } else {
                balanceChanges = {
                    ...this.goldBalanceService.add({
                        entity: user,
                        amount: dailyRewards[user.dailyRewardStreak].golds
                    })
                }
            }

            // Start transaction
            await queryRunner.startTransaction()
            try {
                // Save user
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...userChanges,
                    ...balanceChanges
                })

                await queryRunner.commitTransaction()

                this.logger.log(`Successfully claimed daily reward for user ${request.userId}`)
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
