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
import { FollowRequest } from "./follow.dto"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection
    ) {}

    async follow({ followeeUserId, userId }: FollowRequest) {
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
                    throw new GrpcInvalidArgumentException("Cannot follow self")
                }

                const followee = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(followeeUserId)
                    .session(session)

                if (!followee) {
                    throw new GrpcNotFoundException("Followee not found")
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
                    throw new GrpcFailedPreconditionException("Already following")
                }

                // Check if the user has reached the followee limit
                const followeeCount = await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .countDocuments({
                        follower: userId
                    })
                    .session(session)

                if (followeeCount >= followeeLimit) {
                    throw new GrpcFailedPreconditionException("Followee limit reached")
                }

                // Create the follow relation
                await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .create([{ followee: followeeUserId, follower: userId }], { session })

                return {} // Return an empty object as the response
            })

            return result // Return the result from the transaction
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
