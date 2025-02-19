import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserFollowRelationSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GetFolloweesArgs, GetFolloweesResponse, GetNeighborsArgs, GetNeighborsResponse } from "./users.dto"
import { UserLike } from "@src/jwt"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getUser(id: string): Promise<UserSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<UserSchema>(UserSchema.name).findById(id).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getNeighbors({ id }: UserLike, { limit, offset }: GetNeighborsArgs): Promise<GetNeighborsResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const data = await this.connection.model<UserSchema>(UserSchema.name).find({
                _id: { $ne: id }
            }).session(mongoSession).skip(offset).limit(limit)

            // transform data to determine if user is following or not
            const userIds = data.map(({ id }) => id)
            // get all relations
            const relations = await this.connection.model<UserFollowRelationSchema>(UserFollowRelationSchema.name).find({
                follower: id,
                followee: { $in: userIds }
            }).session(mongoSession)
            // map relations to object
            data.map((user) => {
                user.followed = !!relations.find(({ followee }) => followee === user.id)
                return user
            })
            const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
                _id: { $ne: id }
            }).session(mongoSession)

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }

    async getFollowees({ id }: UserLike, { limit, offset }: GetFolloweesArgs): Promise<GetFolloweesResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const relations = await this.connection.model<UserFollowRelationSchema>(UserFollowRelationSchema.name).find({
                follower: id
            }).session(mongoSession)
            const followeeIds = relations.map(({ followee }) => followee)
            const data = await this.connection.model<UserSchema>(UserSchema.name).find({
                _id: { $in: followeeIds }
            }).session(mongoSession).skip(offset).limit(limit)

            const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
                _id: { $in: followeeIds }
            }).session(mongoSession)
            
            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
