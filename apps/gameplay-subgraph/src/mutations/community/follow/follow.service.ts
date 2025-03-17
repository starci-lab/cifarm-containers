import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
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
import { createObjectId } from "@src/common"
import { UserLike } from "@src/jwt"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    constructor(@InjectMongoose() private readonly connection: Connection) {}

    async follow({ id: userId }: UserLike, { followeeUserId }: FollowRequest): Promise<void> {
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
                    throw new BadRequestException("Cannot follow self")
                }

                const followee = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(followeeUserId)
                    .session(session)

                if (!followee) {
                    throw new NotFoundException("Followee not found")
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
                    throw new BadRequestException("Already following")
                }

                // Check if the user has reached the followee limit
                const followeeCount = await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .countDocuments({
                        follower: userId
                    })
                    .session(session)

                if (followeeCount >= followeeLimit) {
                    throw new BadRequestException("Followee limit reached")
                }

                // Create the follow relation
                await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .create([{ followee: followeeUserId, follower: userId }], { session })

                // No return value needed for void
            })

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
