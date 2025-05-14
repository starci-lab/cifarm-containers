import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserFollowRelationSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import {
    FolloweesRequest,
    FolloweesResponse,
    NeighborsRequest,
    NeighborsResponse,
    NeighborsSearchStatus
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

    private getStatusFilter(status?: NeighborsSearchStatus, useAdvancedSearch?: boolean) {
        if (!status || status === NeighborsSearchStatus.All || useAdvancedSearch) {
            return {}
        }
        if (status === NeighborsSearchStatus.Online) {
            return { isOnline: true }
        } else if (status === NeighborsSearchStatus.Offline) {
            return { isOnline: false }
        }
    }

    private getLevelFilter(levelStart?: number, levelEnd?: number, isFullTextSearch?: boolean) {
        if (!levelStart && !levelEnd || isFullTextSearch) {
            return {}
        }
        return { level: { 
            ...(levelStart ? { $gte: levelStart } : {}),
            ...(levelEnd ? { $lte: levelEnd } : {})
        }
        }
    }

    async neighbors(
        { id }: UserLike,
        { limit, offset, searchString, status, levelStart, levelEnd, useAdvancedSearch }: NeighborsRequest
    ): Promise<NeighborsResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(id).session(mongoSession)
            const data = await this.connection
                .model<UserSchema>(UserSchema.name)
                .find({
                    _id: { $ne: id },
                    ...this.getLevelFilter(levelStart, levelEnd, useAdvancedSearch),
                    $or: [
                        { username: { $regex: new RegExp(searchString, "i") } },
                        { email: { $regex: new RegExp(searchString, "i") } }
                    ],
                    network: user.network,
                    ...this.getStatusFilter(status, useAdvancedSearch)
                })
                .skip(offset)
                .limit(limit)
                .session(mongoSession)

            // transform data to determine if user is following or not
            const userIds = data.map(({ id }) => id)
            // get all relations
            const relations = await this.connection
                .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                .find({
                    follower: id,
                    followee: { $in: userIds }
                }).session(mongoSession)
            // map relations to object
            data.map((user) => {
                user.followed = !!relations.find(({ followee }) => followee.toString() === user.id)
                return user
            })
            const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
                _id: { $ne: id },
                ...this.getLevelFilter(levelStart, levelEnd, useAdvancedSearch),
                $or: [
                    { username: { $regex: new RegExp(searchString, "i") } },
                    { email: { $regex: new RegExp(searchString, "i") } }
                ],
                network: user.network,
                ...this.getStatusFilter(status, useAdvancedSearch)
            }).session(mongoSession)

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }

    async followees(
        { id }: UserLike,
        { limit, offset, searchString, status, levelStart, levelEnd, useAdvancedSearch }: FolloweesRequest
    ): Promise<FolloweesResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(id).session(mongoSession)
            
            const relations = await this.connection
                .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
                .find({
                    follower: id
                }).session(mongoSession)
            const followeeIds = relations.map(({ followee }) => followee)
            
            const data = await this.connection
                .model<UserSchema>(UserSchema.name)
                .find({
                    _id: { $in: followeeIds },
                    ...this.getLevelFilter(levelStart, levelEnd, useAdvancedSearch),
                    $or: [
                        //fully option, search as you want
                        { username: { $regex: new RegExp(searchString, "i") } },
                        { email: { $regex: new RegExp(searchString, "i") } },
                        { id: { $regex: new RegExp(searchString, "i") } },
                        { oauthProviderId: { $regex: new RegExp(searchString, "i") } }
                    ],
                    network: user.network,
                    ...this.getStatusFilter(status, useAdvancedSearch)
                })
                .skip(offset)
                .limit(limit)
                .session(mongoSession)

            // map relations to object
            data.map((user) => {
                user.followed = !!relations.find(({ followee }) => followee.toString() === user.id)
                return user
            })

            const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
                _id: { $in: followeeIds },
                ...this.getLevelFilter(levelStart, levelEnd, useAdvancedSearch),
                $or: [
                    //fully option, search as you want
                    { username: { $regex: new RegExp(searchString, "i") } },
                    { email: { $regex: new RegExp(searchString, "i") } },
                    { id: { $regex: new RegExp(searchString, "i") } },
                    { oauthProviderId: { $regex: new RegExp(searchString, "i") } }
                ],
                network: user.network,
                ...this.getStatusFilter(status, useAdvancedSearch)
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
