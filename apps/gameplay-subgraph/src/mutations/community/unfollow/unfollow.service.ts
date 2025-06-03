import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest } from "./unfollow.dto"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UnfollowService {
    private readonly logger = new Logger(UnfollowService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async unfollow(
        { id: userId }: UserLike,
        { followeeUserId }: UnfollowRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            await mongoSession.withTransaction(async (session) => {
                const followee = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(followeeUserId)
                    .session(session)
                if (!followee) {
                    throw new GraphQLError("Followee not found", {
                        extensions: {
                            code: "FOLLOWEE_NOT_FOUND"
                        }
                    })
                }
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
                if (user.network !== followee.network) {
                    throw new GraphQLError("Cannot unfollow neighbor in different network", {
                        extensions: {
                            code: "CANNOT_UNFOLLOW_NEIGHBOR_IN_DIFFERENT_NETWORK"
                        }
                    })
                }
                if (!user.followeeUserIds.map(id => id.toString()).includes(followeeUserId)) {
                    throw new GraphQLError("Not following", {
                        extensions: {
                            code: "NOT_FOLLOWING"
                        }
                    })
                }
                // delete the follow relation
                user.followeeUserIds = user.followeeUserIds.filter(id => id.toString() !== followeeUserId)
                await user.save({ session })
            })
            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
