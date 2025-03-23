import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserFollowRelationSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import {
    FolloweesRequest,
    FolloweesResponse,
    NeighborsRequest,
    NeighborsResponse
} from "./users.dto"
import { UserLike } from "@src/jwt"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async user(id: string): Promise<UserSchema> {
        return await this.connection.model<UserSchema>(UserSchema.name).findById(id)
    }

    async neighbors(
        { id }: UserLike,
        { limit, offset, searchString }: NeighborsRequest
    ): Promise<NeighborsResponse> {
        const data = await this.connection
            .model<UserSchema>(UserSchema.name)
            .find({
                _id: { $ne: id },
                username: { $regex: new RegExp(searchString, "i") }
            })
            .skip(offset)
            .limit(limit)

        // transform data to determine if user is following or not
        const userIds = data.map(({ id }) => id)
        // get all relations
        const relations = await this.connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .find({
                follower: id,
                followee: { $in: userIds }
            })
        // map relations to object
        data.map((user) => {
            user.followed = !!relations.find(({ followee }) => followee.toString() === user.id)
            return user
        })
        const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
            _id: { $ne: id }
        })

        return {
            data,
            count
        }
    }

    async followees(
        { id }: UserLike,
        { limit, offset, searchString }: FolloweesRequest
    ): Promise<FolloweesResponse> {
        const relations = await this.connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .find({
                follower: id
            })
        const followeeIds = relations.map(({ followee }) => followee)
        const data = await this.connection
            .model<UserSchema>(UserSchema.name)
            .find({
                _id: { $in: followeeIds },
                username: { $regex: new RegExp(searchString, "i") }
            })
            .skip(offset)
            .limit(limit)

        const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
            _id: { $in: followeeIds }
        })

        return {
            data,
            count
        }
    }
}
