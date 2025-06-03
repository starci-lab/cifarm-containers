import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
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
import { ElasticsearchService } from "@nestjs/elasticsearch"
import { createIndexName } from "@src/elasticsearch"
import { QueryDslQueryContainer, SortCombinations } from "@elastic/elasticsearch/lib/api/types"
import { GraphQLError } from "graphql"
import { DeepPartial } from "@src/common"
import _ from "lodash"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly elasticsearchService: ElasticsearchService
    ) { }

    async user(id: string): Promise<UserSchema> {
        return await this.connection.model<UserSchema>(UserSchema.name).findById(id)
    }

    private getStatusFilter({ status, useAdvancedSearch, isFullTextSearch }: GetStatusFilterParams) {
        // Skip filter if full text search OR advanced search disabled
        if (isFullTextSearch || !useAdvancedSearch) {
            return {}
        }

        if (!status || status === NeighborsSearchStatus.All) {
            return {}
        }

        // Build filter for isOnline field
        return {
            bool: {
                must: [
                    {
                        match: {
                            isOnline: status === NeighborsSearchStatus.Online,
                        },
                    },
                ],
            },
        }
    }

    private isFullTextSearch(searchString?: string) {
        return searchString && searchString.length > 8
    }

    private getLevelFilter({
        userLevel,
        levelStart,
        levelEnd,
        isFullTextSearch,
        useAdvancedSearch
    }: GetLevelFilterParams): Partial<QueryDslQueryContainer> {

        // skip if full-text or advanced search not used
        if (isFullTextSearch || !useAdvancedSearch) {
            return {}
        }

        // if no explicit range provided, apply default gap around userLevel
        if (!levelStart && !levelEnd) {
            const gap = this.staticService.interactionPermissions.thiefLevelGapThreshold

            return {
                range: {
                    level: {
                        gte: userLevel - gap,
                        lte: userLevel + gap,
                    }
                }
            }
        }

        // apply range with given start/end
        return {
            range: {
                level: {
                    ...(levelStart !== undefined ? { gte: levelStart } : {}),
                    ...(levelEnd !== undefined ? { lte: levelEnd } : {})
                }
            }
        }
    }

    private getSearchFilter({
        searchString,
        isFullTextSearch
    }: GetSearchFilterParams): Partial<QueryDslQueryContainer> {
        if (!searchString) {
            return {}
        }

        if (isFullTextSearch) {
            // Full-text search: use multi_match for analyzed fields
            return {
                multi_match: {
                    query: searchString,
                    fields: ["username", "email", "id", "oauthProviderId"],
                    type: "best_fields", // or 'phrase', 'most_fields' depending on need
                    fuzziness: "AUTO",   // optional: fuzzy search
                },
            }
        } else {
            // For "non-fulltext" (like regex), approximate with wildcard queries
            // ES does not support regex like MongoDB, so wildcard is closest
            return {
                bool: {
                    should: [
                        {
                            query_string: {
                                query: `*${searchString.toLowerCase()}*`,
                                fields: ["username", "email", "id", "oauthProviderId"],
                                analyze_wildcard: true,
                            },
                        },
                    ],
                    minimum_should_match: 1,
                },
            }
        }
    }

    private sortDefault(user: DeepPartial<UserSchema>): Array<SortCombinations> {
        return [
            {
                _script: {
                    type: "number",
                    script: {
                        source: "Math.abs(doc['level'].value - params.userLevel)",
                        params: { userLevel: user.level ?? 1 }
                    },
                    order: "asc"
                }
            },
            {
                followed: { 
                    order: "desc", 
                    unmapped_type: "boolean" 
                } 
            },
            {
                lastOnlineTime: {
                    order: "asc",
                    unmapped_type: "date"
                }
            }
        ]
    }

    async neighbors(
        { id }: UserLike,
        { limit, offset, searchString, status, levelStart, levelEnd, useAdvancedSearch }: NeighborsRequest
    ): Promise<NeighborsResponse> {
        const user = await this.connection.model<UserSchema>(UserSchema.name).findById(id)

        const isFullTextSearch = this.isFullTextSearch(searchString)
        
        // Get each filter, return null if filter is empty
        const levelFilter = this.getLevelFilter({ userLevel: user.level, levelStart, levelEnd, isFullTextSearch, useAdvancedSearch })
        const searchFilter = this.getSearchFilter({ searchString, isFullTextSearch })
        const statusFilter = this.getStatusFilter({ status, useAdvancedSearch, isFullTextSearch })

        // Array of queries, remove null or empty objects
        const mustClauses: Array<QueryDslQueryContainer> = [
            { match: { network: user.network } },
            levelFilter && Object.keys(levelFilter).length > 0 ? levelFilter : null,
            searchFilter && Object.keys(searchFilter).length > 0 ? searchFilter : null,
            statusFilter && Object.keys(statusFilter).length > 0 ? statusFilter : null,
        ].filter((query): query is QueryDslQueryContainer => !!query) // lọc null và kiểu guard

        // must not be the same user
        const mustNotClauses: Array<QueryDslQueryContainer> = [
            { term: { id: user.id } }
        ]
        // flatten if there is bool.must inside the filter
        const flattenedMust: Array<QueryDslQueryContainer> = []

        for (const clause of mustClauses) {
            if ("bool" in clause && clause.bool?.must) {
                if (Array.isArray(clause.bool.must)) {
                    flattenedMust.push(...clause.bool.must)
                } else {
                    flattenedMust.push(clause.bool.must)
                }
            } else {
                flattenedMust.push(clause)
            }
        }

        const finalQuery: QueryDslQueryContainer = {
            bool: {
                must: flattenedMust,
                must_not: mustNotClauses
            }
        }

        const sort = this.sortDefault(user)

        // Search
        const result = await this.elasticsearchService.search<UserSchema>({
            index: createIndexName(UserSchema.name),
            query: finalQuery,
            from: offset,
            size: limit,
            sort
        })

        const data: Array<UserSchema> = result.hits.hits.map((hit) => {
            const followee = user.followeeUserIds.map((followee) => followee.toString()).includes(hit._source.id)
            if (!hit._source) {
                throw new GraphQLError("User not found")
            }
            const source = _.cloneDeep(hit._source)
            source.followed = followee
            return source
        })

        // Count
        const count = await this.elasticsearchService.count({
            index: createIndexName(UserSchema.name),
            query: finalQuery,
        })

        return {
            data,
            count: count.count,
        }
    }

    async followees(
        { id }: UserLike,
        { limit, offset, searchString, status, levelStart, levelEnd, useAdvancedSearch }: FolloweesRequest
    ): Promise<FolloweesResponse> {
        // Lấy user từ MongoDB (cần user level và network)
        const user = await this.connection.model<UserSchema>(UserSchema.name).findById(id)

        // Get followee IDs from the user's followee list
        const followeeIds = user.followeeUserIds.map((followee) => followee.toString())

        if (followeeIds.length === 0) {
            // No followee, return immediately
            return {
                data: [],
                count: 0,
            }
        }

        const isFullTextSearch = this.isFullTextSearch(searchString)

        // Create query filter for followees: filter _id must be in followeeIds
        const followeeIdsQuery: QueryDslQueryContainer = {
            ids: {
                values: followeeIds,
            }
        }

        // Get other filters
        const levelFilter = this.getLevelFilter({ userLevel: user.level, levelStart, levelEnd, isFullTextSearch, useAdvancedSearch })
        const searchFilter = this.getSearchFilter({ searchString, isFullTextSearch })
        const statusFilter = this.getStatusFilter({ status, useAdvancedSearch, isFullTextSearch })

        // Combine filters
        const mustClauses: Array<QueryDslQueryContainer> = [
            followeeIdsQuery,
            { match: { network: user.network } },
            levelFilter && Object.keys(levelFilter).length > 0 ? levelFilter : null,
            searchFilter && Object.keys(searchFilter).length > 0 ? searchFilter : null,
            statusFilter && Object.keys(statusFilter).length > 0 ? statusFilter : null,
        ].filter((query): query is QueryDslQueryContainer => !!query)

        // must not be the same user
        const mustNotClauses: Array<QueryDslQueryContainer> = [
            { term: { id: user.id } }
        ]
        // flatten if there is bool.must inside the filter
        const flattenedMust: Array<QueryDslQueryContainer> = []
        for (const clause of mustClauses) {
            if ("bool" in clause && clause.bool?.must) {
                if (Array.isArray(clause.bool.must)) {
                    flattenedMust.push(...clause.bool.must)
                } else {
                    flattenedMust.push(clause.bool.must)
                }
            } else {
                flattenedMust.push(clause)
            }
        }

        const sort = this.sortDefault(user)

        const finalQuery: QueryDslQueryContainer = {
            bool: {
                must: flattenedMust,
                must_not: mustNotClauses
            }
        }

        // Search in ES
        const result = await this.elasticsearchService.search<UserSchema>({
            index: createIndexName(UserSchema.name),
            query: finalQuery,
            from: offset,
            size: limit,
            sort
        })

        const data: Array<UserSchema> = result.hits.hits.map((hit) => {
            const followee = user.followeeUserIds.map((followee) => followee.toString()).includes(hit._source.id)
            if (!hit._source) {
                throw new GraphQLError("User not found")
            }
            const source = _.cloneDeep(hit._source)
            source.followed = followee
            return source
        })  

        // Count total followees
        const count = await this.elasticsearchService.count({
            index: createIndexName(UserSchema.name),
            query: finalQuery,
        })

        return {
            data,
            count: count.count,
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
