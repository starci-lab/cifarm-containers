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

    private isFullTextSearch(searchString?: string) {
        return searchString?.length > 5
    }

    private getStatusFilter(status?: NeighborsSearchStatus, isFullTextSearch?: boolean) {
        if (!status || status === NeighborsSearchStatus.All || isFullTextSearch) {
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
        { limit, offset, searchString, status, levelStart, levelEnd }: NeighborsRequest
    ): Promise<NeighborsResponse> {
        const mongoSession = await this.connection.startSession()
        // if text length > 5, we know that is it a full-text search, remove all other filters
        const isFullTextSearch = this.isFullTextSearch(searchString)
        try {
            const data = await this.connection
                .model<UserSchema>(UserSchema.name)
                .find({
                    _id: { $ne: id },
                    ...this.getLevelFilter(levelStart, levelEnd, isFullTextSearch),
                    $or: [
                        { username: { $regex: new RegExp(searchString, "i") } },
                        { accountAddress: { $regex: new RegExp(searchString, "i") } }
                    ],
                    ...this.getStatusFilter(status, isFullTextSearch)
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
                _id: { $ne: id },
                ...this.getLevelFilter(levelStart, levelEnd, isFullTextSearch),
                $or: [
                    { username: { $regex: new RegExp(searchString, "i") } },
                    { accountAddress: { $regex: new RegExp(searchString, "i") } }
                ],
                ...this.getStatusFilter(status, isFullTextSearch)
            })

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
        { limit, offset, searchString, status, levelStart, levelEnd }: FolloweesRequest
    ): Promise<FolloweesResponse> {
        const mongoSession = await this.connection.startSession()
        // if text length > 5, we know that is it a full-text search, remove all other filters
        const isFullTextSearch = this.isFullTextSearch(searchString)
        try {
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
                    ...this.getLevelFilter(levelStart, levelEnd, isFullTextSearch),
                    $or: [
                        { username: { $regex: new RegExp(searchString, "i") } },
                        { accountAddress: { $regex: new RegExp(searchString, "i") } }
                    ],
                    ...this.getStatusFilter(status, isFullTextSearch)
                })
                .skip(offset)
                .limit(limit)

            const count = await this.connection.model<UserSchema>(UserSchema.name).countDocuments({
                _id: { $in: followeeIds },
                ...this.getLevelFilter(levelStart, levelEnd, isFullTextSearch),
                $or: [
                    { username: { $regex: new RegExp(searchString, "i") } },
                    { accountAddress: { $regex: new RegExp(searchString, "i") } }
                ],
                ...this.getStatusFilter(status, isFullTextSearch)
            })

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
