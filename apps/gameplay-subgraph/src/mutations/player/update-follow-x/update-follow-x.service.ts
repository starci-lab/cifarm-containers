import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { TokenBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"

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
        const mongoSession = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async () => {
                // Get followX reward quantity from system configuration
                const { followXRewardQuantity } = this.staticService.defaultInfo

                // Get the user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // If the user already has followX awarded, return early
                if (user.followXAwarded) {
                    // No return value needed for void
                    return
                }

                // Update the token balance for the user
                const tokenBalanceChanges = this.tokenBalanceService.add({
                    user,
                    amount: followXRewardQuantity
                })

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
                    .session(mongoSession)
            })

            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
