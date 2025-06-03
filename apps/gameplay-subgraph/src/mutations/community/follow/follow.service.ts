import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { Connection, Types } from "mongoose"
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
            const result = await mongoSession.withTransaction(async (session) => {
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
                
                if (user.followeeUserIds.map(id => id.toString()).includes(followeeUserId)) {
                    throw new GraphQLError("Already following", {
                        extensions: {
                            code: "ALREADY_FOLLOWING",
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
                if (user.followeeUserIds.length >= followeeLimit) {
                    throw new GraphQLError("Followee limit reached", {
                        extensions: {
                            code: "FOLLOWEE_LIMIT_REACHED",
                        }
                    })
                }
                // Add the followee to the user's followee list
                user.followeeUserIds.push(new Types.ObjectId(followeeUserId))
                await user.save({ session })
                // No return value needed for void
                return {
                    success: true,
                    message: "Followed successfully",
                }
            })
            return result
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
