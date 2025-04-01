import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection, Types } from "mongoose"
import { UpdateReferralRequest, UpdateReferralResponse } from "./update-referral.dto"
import { TokenBalanceService, StaticService, SyncService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"
import { WithStatus } from "@src/common"

@Injectable()
export class UpdateReferralService {
    private readonly logger = new Logger(UpdateReferralService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async updateReferral(
        { id: userId }: UserLike,
        { referralUserId }: UpdateReferralRequest
    ): Promise<UpdateReferralResponse> {
        const mongoSession = await this.connection.startSession()
        let syncedUser: WithStatus<UserSchema> | undefined
        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                const { referredLimit, referralRewardQuantity, referredRewardQuantity } =
                    this.staticService.defaultInfo

                /************************************************************
                 * RETRIEVE AND VALIDATE REFERRAL USER
                 ************************************************************/
                const referralUser = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(referralUserId)
                    .session(session)

                if (!referralUser) {
                    throw new GraphQLError("Referral user not found", {
                        extensions: {
                            code: "REFERRAL_USER_NOT_FOUND"
                        }
                    })
                }

                if (referralUser.referredUserIds.length >= referredLimit) {
                    throw new GraphQLError("Referral user has reached the limit", {
                        extensions: {
                            code: "REFERRAL_LIMIT_REACHED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }
                const userSnapshot = user.$clone()

                /************************************************************
                 * VALIDATE REFERRAL ELIGIBILITY
                 ************************************************************/
                // Check if referral user is the same as the user
                if (referralUserId === userId) {
                    throw new GraphQLError("Referral user cannot be the same as the user", {
                        extensions: {
                            code: "INVALID_SELF_REFERRAL"
                        }
                    })
                }

                // Check if user already has a referral
                if (user.referralUserId) {
                    return
                }

                // Check if the user has already been referred by the same referral user
                if (referralUser.referredUserIds.map((id) => id.toString()).includes(user.id)) {
                    return
                }

                /************************************************************
                 * UPDATE TOKEN BALANCES
                 ************************************************************/
                // Handle referral rewards and update balances
                this.tokenBalanceService.add({
                    amount: referredRewardQuantity,
                    user: referralUser
                })

                this.tokenBalanceService.add({
                    amount: referralRewardQuantity,
                    user
                })

                /************************************************************
                 * UPDATE REFERRAL USER DATA
                 ************************************************************/
                // Update the referral user with the new referred user
                referralUser.referredUserIds.push(new Types.ObjectId(userId))
                await referralUser.save({ session })

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update the referred user with their referral information
                user.referralUserId = new Types.ObjectId(referralUserId)
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        { value: JSON.stringify({ userId, data: syncedUser }) }
                    ]
                })
            ])

            return {
                success: true,
                message: "Referral updated successfully",
            }
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow the error after logging
        } finally {
            await mongoSession.endSession() // Ensure the session is always ended
        }
    }
}
