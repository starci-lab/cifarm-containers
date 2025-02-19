import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest, UnfollowResponse } from "./unfollow.dto"
import { InjectMongoose, UserSchema } from "@src/databases"
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
        mongoSession.startTransaction()
        try {
            const followee = await this.connection.model<UserSchema>(UserSchema.name).findById(followeeUserId).session(mongoSession)
            if (!followee) {
                throw new GrpcNotFoundException("Followee not found")
            }
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId).session(mongoSession)
            // check if user is following followee
            const following = user.followees.find(followee => followee.id === followee.id)
            if (!following) {
                throw new GrpcFailedPreconditionException("User is not following followee")
            }
            // update user with followee
            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: userId },
                {
                    $pull: {
                        followees: {
                            _id: followee._id
                        }
                    }
                }
            ).session(mongoSession)
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
