import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema,
} from "@src/databases"
import { Connection } from "mongoose"
import { HoneycombService } from "@src/honeycomb"
import { DateUtcService } from "@src/date"
import { UserLike } from "@src/jwt"
import { TxResponse } from "../types"
import { StaticService } from "@src/gameplay"
import { GraphQLError } from "graphql"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class ClaimHoneycombDailyRewardService {
    private readonly logger = new Logger(ClaimHoneycombDailyRewardService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async claimHoneycombDailyReward(
        { id: userId }: UserLike,): Promise<TxResponse> {
        const mongoSession = await this.connection.startSession()
        let user: UserSchema | undefined
        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * CHECK DAILY REWARD ELIGIBILITY
                 ************************************************************/
                // Check if reward was already claimed today
                const now = this.dateUtcService.getDayjs()

                if (
                    user.honeycombDailyRewardLastClaimTime &&
                    now.isSame(user.honeycombDailyRewardLastClaimTime, "day")
                ) {
                    throw new GraphQLError(
                        "Honeycomb daily reward already claimed today",
                        {
                            extensions: {
                                code: "HONEYCOMB_DAILY_REWARD_ALREADY_CLAIMED_TODAY"
                            }
                        }
                    )
                }

                /************************************************************
                 * CREATE MINT TRANSACTION
                 ************************************************************/
                const { dailyRewardAmount, tokenResourceAddress } = this.staticService.honeycombInfo

                const { txResponse } = await this.honeycombService.createMintResourceTransaction({
                    amount: dailyRewardAmount,
                    resourceAddress: tokenResourceAddress,
                    network: user.network,
                    payerAddress: user.accountAddress,
                    toAddress: user.accountAddress
                })

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update user honeycomb daily reward last claim time
                user.honeycombDailyRewardLastClaimTime = now.toDate()
                await user.save({ session: mongoSession })
                return txResponse
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: user.toJSON() }) }]
                })
            ])
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
