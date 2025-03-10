import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema,
    HoneycombInfo
} from "@src/databases"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Connection } from "mongoose"
import {
    ClaimHoneycombDailyRewardRequest,
    ClaimHoneycombDailyRewardResponse
} from "./claim-honeycomb-daily-reward.dto"
import { HoneycombService } from "@src/honeycomb"
import { DateUtcService } from "@src/date"

@Injectable()
export class ClaimHoneycombDailyRewardService {
    private readonly logger = new Logger(ClaimHoneycombDailyRewardService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly dateUtcService: DateUtcService
    ) {}

    async claimHoneycombDailyReward({
        userId
    }: ClaimHoneycombDailyRewardRequest): Promise<ClaimHoneycombDailyRewardResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async () => {
            // check if spin last time is same as today
                const now = this.dateUtcService.getDayjs()

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (
                    user.honeycombDailyRewardLastClaimTime &&
                now.isSame(user.honeycombDailyRewardLastClaimTime, "day")
                ) {
                    throw new GrpcFailedPreconditionException(
                        "Honeycomb daily reward already claimed today"
                    )
                }

                const {
                    value: { dailyRewardAmount, tokenResourceAddress }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<HoneycombInfo>>(createObjectId(SystemId.HoneycombInfo))
                const { txResponse } = await this.honeycombService.createMintResourceTransaction({
                    amount: dailyRewardAmount,
                    resourceAddress: tokenResourceAddress,
                    network: user.network,
                    payerAddress: user.accountAddress,
                    toAddress: user.accountAddress
                })

                // update user honeycomb daily reward last claim time
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: userId },
                        { $set: { honeycombDailyRewardLastClaimTime: now.toDate() } }
                    )
                    .session(mongoSession)
                return txResponse
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
