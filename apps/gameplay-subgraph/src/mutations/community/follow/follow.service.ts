import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserFollowRelationSchema,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { FollowRequest, FollowResponse } from "./follow.dto"
import { createObjectId } from "@src/common"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    constructor(@InjectMongoose() private readonly connection: Connection) {}

    async follow({ id: userId }: UserLike, { followeeUserId }: FollowRequest): Promise<FollowResponse> {
        const mongoSession = await this.connection.startSession()
        
        try {
            // Using withTransaction to handle the transaction lifecycle
            await mongoSession.withTransaction(async (session) => {
                const {
                    value: { followeeLimit }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(session)

                if (userId === followeeUserId) {
                    throw new GraphQLError("Cannot follow self", {
                        extensions: {
                            code: "CANNOT_FOLLOW_SELF",
                        }
                    })
                }

                const followee = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(followeeUserId)
                    .session(session)

                if (!followee) {
                    throw new GraphQLError("Followee not found", {
                        extensions: {
                            code: "FOLLOWEE_NOT_FOUND",
                        }
                    })
                }

                // Check if user is already following the followee
                const following = await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .exists({
                        followee: followeeUserId,
                        follower: userId
                    })
                    .session(session)

                if (following) {
                    throw new GraphQLError("Already following", {
                        extensions: {
                            code: "ALREADY_FOLLOWING",
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
                            code: "USER_NOT_FOUND",
                        }
                    })
                }
                if (user.network !== followee.network) {
                    throw new GraphQLError("Cannot follow neighbor in different network", {
                        extensions: {
                            code: "CANNOT_FOLLOW_NEIGHBOR_IN_DIFFERENT_NETWORK",
                        }
                    })
                }
                // Check if the user has reached the followee limit
                const followeeCount = await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .countDocuments({
                        follower: userId
                    })
                    .session(session)

                if (followeeCount >= followeeLimit) {
                    throw new GraphQLError("Followee limit reached", {
                        extensions: {
                            code: "FOLLOWEE_LIMIT_REACHED",
                        }
                    })
                }

                // Create the follow relation
                await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .create([{ followee: followeeUserId, follower: userId }], { session })

                // No return value needed for void
            })
            return {
                success: true,
                message: "Followed successfully",
            }
            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            // withTransaction automatically handles rollback, no need for manual abort
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
