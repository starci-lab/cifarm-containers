import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    SystemId,
    SystemRecord,
    SystemSchema,
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
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async follow({ followeeUserId, userId }: FollowRequest) {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const {
                value: { followeeLimit }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)
            if (userId === followeeUserId) {
                throw new GrpcInvalidArgumentException("Cannot follow self")
            }
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
            
            // check if user is already following followee
            const following = user.followees.find((followee) => followee.id === followee.id)
            if (following) {
                throw new GrpcFailedPreconditionException("User is already following followee")
            }

            // check if user has reached followee limit
            if (user.followees.length >= followeeLimit) {
                throw new GrpcFailedPreconditionException("Followee limit reached")
            }

            // update user with followee
            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne(
                    { _id: userId },
                    {
                        $push: {
                            followees: {
                                followee: followee.id // Assuming followee is an instance of the followee object
                            }
                        }
                    }
                )
                .session(mongoSession)
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
