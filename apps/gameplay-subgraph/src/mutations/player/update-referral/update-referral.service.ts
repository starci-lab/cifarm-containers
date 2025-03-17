import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { UpdateReferralRequest } from "./update-referral.dto"
import { TokenBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UpdateReferralService {
    private readonly logger = new Logger(UpdateReferralService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService
    ) {}

    async updateReferral(
        {
            id: userId
        }: UserLike,
        {
            referralUserId
        }: UpdateReferralRequest): Promise<void> {
        const session = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            await session.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                const { referredLimit, referralRewardQuantity, referredRewardQuantity } = this.staticService.defaultInfo

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
                if (referralUser.referredUserIds.includes(user.id)) {
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
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: referralUser._id },
                        { $push: { referredUserIds: userId } }
                    )
                    .session(session)

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update the referred user with their referral information
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: userId },
                        { $set: { referralUserId: referralUserId } }
                    )
                    .session(session)
            })
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow the error after logging
        } finally {
            await session.endSession() // Ensure the session is always ended
        }
    }
}
