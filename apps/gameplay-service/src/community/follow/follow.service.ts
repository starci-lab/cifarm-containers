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
                .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
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
            // check if user is already following followee
            const following = this.connection
                .model<UserFollowRelationSchema>(UserFollowRelationSchema.name).exists({
                    followee: followeeUserId,
                    follower: userId
                })
                .session(mongoSession)
            if (following) {
                throw new GrpcFailedPreconditionException("Already following")
            }
            // check if user has reached followee limit
            const followeeCount = await this.connection
                .model<UserFollowRelationSchema>(UserFollowRelationSchema.name).countDocuments({
                    follower: userId
                })
                .session(mongoSession)
            if (followeeCount >= followeeLimit) {
                throw new GrpcFailedPreconditionException("Followee limit reached")
            }
            // create follow relation
            await this.connection
                .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                .create([{ followee: followeeUserId, follower: userId }], { session: mongoSession })
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
