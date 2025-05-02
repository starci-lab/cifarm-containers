import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { StaticService, GoldBalanceService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { UpdateFollowXResponse } from "./update-follow-x.dto"

@Injectable()
export class UpdateFollowXService {
    private readonly logger = new Logger(UpdateFollowXService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
    ) {}

    async updateFollowX({
        id: userId
    }: UserLike): Promise<UpdateFollowXResponse> {
        const mongoSession = await this.connection.startSession()
        let user: UserSchema | undefined
        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                // Get followX reward quantity from system configuration
                const { followXRewardQuantity } = this.staticService.defaultInfo

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get the user data
                user = await this.connection
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
                 * CHECK ELIGIBILITY
                 ************************************************************/
                // If the user already has followX awarded, return early
                if (user.followXAwarded) {
                    return
                }

                /************************************************************
                 * UPDATE TOKEN BALANCE
                 ************************************************************/
                // Update the token balance for the user
                this.goldBalanceService.add({
                    user,
                    amount: followXRewardQuantity
                })

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update user with the new token balance and mark followXAwarded as true
                user.followXAwarded = true
                await user.save({ session })
                return {
                    success: true,
                    message: "FollowX updated successfully",
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
