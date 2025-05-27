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
import { StaticService } from "@src/gameplay"
@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService
    ) { }

    async user(id: string): Promise<UserSchema> {
        return await this.connection.model<UserSchema>(UserSchema.name).findById(id)
    }

    private getStatusFilter({ status, useAdvancedSearch, isFullTextSearch }: GetStatusFilterParams) {
        // do not add this fillter if full text search or advanced search is used
        if (isFullTextSearch || !useAdvancedSearch) {
            return {}
        }
        if (!status || status === NeighborsSearchStatus.All) {
            return {}
        }
        if (status === NeighborsSearchStatus.Online) {
            return { isOnline: true }
        } else if (status === NeighborsSearchStatus.Offline) {
            return { isOnline: false }
        }
    }

    private isFullTextSearch(searchString?: string) {
        return searchString && searchString.length > 8
    }

    private getLevelFilter(
        { userLevel, levelStart, levelEnd, isFullTextSearch, useAdvancedSearch }: GetLevelFilterParams
    ) {
        // do not add this fillter if full text search or advanced search is used
        if (isFullTextSearch || !useAdvancedSearch) {
            return {}
        }
        if (!levelStart && !levelEnd) {
            return {
                level: {
                    $gte: userLevel - this.staticService.interactionPermissions.thiefLevelGapThreshold,
                    $lte: userLevel + this.staticService.interactionPermissions.thiefLevelGapThreshold
                }
            }
        }
        return {
            level: {
                ...(levelStart ? { $gte: levelStart } : {}),
                ...(levelEnd ? { $lte: levelEnd } : {})
            }
        }
    }

    private getSearchFilter({ searchString, isFullTextSearch }: GetSearchFilterParams) {
        if (isFullTextSearch) {
            return {
                $or: [
                    { username: searchString },
                    { email: searchString },
                    { id: searchString },
                    { oauthProviderId: searchString }
                ]
            }
        }
        if (!searchString) {
            return {}
        }
        return {
            $or: [
                { username: { $regex: new RegExp(searchString, "i") } },
                { email: { $regex: new RegExp(searchString, "i") } },
                { id: { $regex: new RegExp(searchString, "i") } },
                { oauthProviderId: { $regex: new RegExp(searchString, "i") } }
            ]
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
                    ...this.getLevelFilter({ userLevel: user.level, levelStart, levelEnd, isFullTextSearch: this.isFullTextSearch(searchString), useAdvancedSearch }),
                    ...this.getSearchFilter({ searchString, isFullTextSearch: this.isFullTextSearch(searchString) }),
                    network: user.network,
                    ...this.getStatusFilter({ status, useAdvancedSearch, isFullTextSearch: this.isFullTextSearch(searchString) })
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
                ...this.getLevelFilter({ userLevel: user.level, levelStart, levelEnd, isFullTextSearch: this.isFullTextSearch(searchString), useAdvancedSearch }),
                ...this.getSearchFilter({ searchString, isFullTextSearch: this.isFullTextSearch(searchString) }),
                network: user.network,
                ...this.getStatusFilter({ status, useAdvancedSearch, isFullTextSearch: this.isFullTextSearch(searchString) })
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
                    ...this.getLevelFilter({ userLevel: user.level, levelStart, levelEnd, isFullTextSearch: this.isFullTextSearch(searchString) }),
                    ...this.getSearchFilter({ searchString, isFullTextSearch: this.isFullTextSearch(searchString) }),
                    network: user.network,
                    ...this.getStatusFilter({ status, useAdvancedSearch, isFullTextSearch: this.isFullTextSearch(searchString) })
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
                ...this.getLevelFilter({ userLevel: user.level, levelStart, levelEnd, isFullTextSearch: this.isFullTextSearch(searchString) }),
                ...this.getSearchFilter({ searchString, isFullTextSearch: this.isFullTextSearch(searchString) }),
                network: user.network,
                ...this.getStatusFilter({ status, useAdvancedSearch, isFullTextSearch: this.isFullTextSearch(searchString) })
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

export interface GetLevelFilterParams {
    userLevel: number,
    levelStart?: number,
    levelEnd?: number,
    isFullTextSearch?: boolean,
    useAdvancedSearch?: boolean
}

export interface GetSearchFilterParams {
    searchString?: string,
    isFullTextSearch?: boolean,
}

export interface GetStatusFilterParams {
    status?: NeighborsSearchStatus,
    useAdvancedSearch?: boolean,
    isFullTextSearch?: boolean
}
