import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest, UnfollowResponse } from "./unfollow.dto"
import { InjectMongoose, UserFollowRelationSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class UnfollowService {
    private readonly logger = new Logger(UnfollowService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async unfollow({ followeeUserId, userId }: UnfollowRequest): Promise<UnfollowResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                const followee = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(followeeUserId)
                    .session(mongoSession)
                if (!followee) {
                    throw new GrpcNotFoundException("Followee not found")
                }

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)
                if (!user) {
                    throw new GrpcNotFoundException("User not found")
                }

                const following = await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .exists({
                        followee: followeeUserId,
                        follower: userId
                    })
                    .session(mongoSession)

                if (!following) {
                    throw new GrpcFailedPreconditionException("Not following")
                }

                // delete the follow relation
                await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .deleteOne({
                        followee: followeeUserId,
                        follower: userId
                    })
                    .session(mongoSession)

                // Commit the transaction
                await mongoSession.commitTransaction()
                return {}
            })

            return result
        } catch (error) {
            this.logger.error(error)
            // Abort transaction in case of error
            await mongoSession.abortTransaction()
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
