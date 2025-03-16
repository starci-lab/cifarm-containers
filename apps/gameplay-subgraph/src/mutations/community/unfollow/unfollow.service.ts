import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { UnfollowRequest } from "./unfollow.dto"
import { InjectMongoose, UserFollowRelationSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { EmptyObjectType } from "@src/common"
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
    ): Promise<EmptyObjectType> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
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
                return {}
            })

            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
