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
import { UpdateFollowXRequest, UpdateFollowXResponse } from "./update-follow-x.dto"
import { createObjectId } from "@src/common"
import { TokenBalanceService } from "@src/gameplay"

@Injectable()
export class UpdateFollowXService {
    private readonly logger = new Logger(UpdateFollowXService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService
    ) {}

    async updateFollowX({
        userId
    }: UpdateFollowXRequest): Promise<UpdateFollowXResponse> {
        const mongoSession = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async () => {
                // Get followX reward quantity from system configuration
                const {
                    value: { followXRewardQuantity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(mongoSession)

                // Get the user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // If the user already has followX awarded, return early
                if (user.followXAwarded) {
                    return {}
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

            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
