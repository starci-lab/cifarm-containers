import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { UnfollowRequest } from "./unfollow.dto"
import { InjectMongoose, UserFollowRelationSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"  
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
            await mongoSession.withTransaction(async (mongoSession) => {
                const followee = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(followeeUserId)
                    .session(mongoSession)
                if (!followee) {
                    throw new NotFoundException("Followee not found")
                }

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)
                if (!user) {
                    throw new NotFoundException("User not found")
                }

                const following = await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .exists({
                        followee: followeeUserId,
                        follower: userId
                    })
                    .session(mongoSession)

                if (!following) {
                    throw new BadRequestException("Not following")
                }

                // delete the follow relation
                await this.connection
                    .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                    .deleteOne({
                        followee: followeeUserId,
                        follower: userId
                    })
                    .session(mongoSession)
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
