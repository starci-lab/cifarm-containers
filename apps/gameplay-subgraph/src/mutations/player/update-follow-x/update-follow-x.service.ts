import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { TokenBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UpdateFollowXService {
    private readonly logger = new Logger(UpdateFollowXService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService
    ) {}

    async updateFollowX({
        id: userId
    }: UserLike): Promise<void> {
        const session = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            await session.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                // Get followX reward quantity from system configuration
                const { followXRewardQuantity } = this.staticService.defaultInfo

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get the user data
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
                const tokenBalanceChanges = this.tokenBalanceService.add({
                    user,
                    amount: followXRewardQuantity
                })

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update user with the new token balance and mark followXAwarded as true
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: userId },
                        {
                            $set: {
                                ...tokenBalanceChanges,
                                followXAwarded: true
                            },
                        }
                    )
                    .session(session)
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await session.endSession() // End the session after the transaction
        }
    }
}
