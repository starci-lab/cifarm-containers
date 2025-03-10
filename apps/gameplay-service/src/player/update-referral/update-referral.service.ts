import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    KeyValueRecord,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { UpdateReferralRequest, UpdateReferralResponse } from "./update-referral.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { TokenBalanceService } from "@src/gameplay"

@Injectable()
export class UpdateReferralService {
    private readonly logger = new Logger(UpdateReferralService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService
    ) {}

    async updateReferral({
        referralUserId,
        userId
    }: UpdateReferralRequest): Promise<UpdateReferralResponse> {
        const mongoSession = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async () => {
                const {
                    value: { referredLimit, referralRewardQuantity, referredRewardQuantity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(mongoSession)

                // Retrieve referral and user data
                const referralUser = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(referralUserId)
                    .session(mongoSession)
                if (!referralUser) {
                    throw new GrpcNotFoundException("Referral user not found")
                }

                if (referralUser.referredUserIds.length >= referredLimit) {
                    throw new GrpcFailedPreconditionException("Referral user has reached the limit")
                }

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check if referral user is the same as the user
                if (referralUserId === userId) {
                    throw new GrpcFailedPreconditionException(
                        "Referral user cannot be the same as the user"
                    )
                }

                // Check if user already has a referral
                if (user.referralUserId) {
                    return {}
                }

                // Check if the user has already been referred by the same referral user
                if (referralUser.referredUserIds.includes(user.id)) {
                    return {}
                }

                // Handle referral rewards and update balances
                const referralUserTokenBalanceChanges = this.tokenBalanceService.add({
                    amount: referredRewardQuantity,
                    user: referralUser
                })

                const userTokenBalanceChanges = this.tokenBalanceService.add({
                    amount: referralRewardQuantity,
                    user
                })

                // Update the referral user with the new referred user and token balance changes
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: referralUserId },
                        {
                            $set: {
                                ...referralUserTokenBalanceChanges
                            },
                            $push: {
                                referredUserIds: userId
                            }
                        }
                    )
                    .session(mongoSession)

                // Update the referred user with their referral information
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: userId },
                        {
                            $set: {
                                ...userTokenBalanceChanges,
                                referralUserId: referralUserId
                            }
                        }
                    )
                    .session(mongoSession)

                return {} // Return the response after the transaction
            })

            return result // Return the result from the transaction
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow the error after logging
        } finally {
            await mongoSession.endSession() // Ensure the session is always ended
        }
    }
}
