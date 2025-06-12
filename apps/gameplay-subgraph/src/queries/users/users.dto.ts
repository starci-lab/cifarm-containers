import { Field, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@src/common"
import { UserSchema } from "@src/databases"
import { Network } from "@src/env"
import { GraphQLTypeNetwork } from "@src/env"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export enum NeighborsSearchStatus {
    All = "all",
    Online = "online",
    Offline = "offline"
}

export const GraphQLTypeNeighborsSearchStatus = createEnumType(NeighborsSearchStatus)

registerEnumType(GraphQLTypeNeighborsSearchStatus, {
    name: "NeighborsSearchStatus",
    description: "The neighbors search status.",
    valuesMap: {
        [NeighborsSearchStatus.All]: {
            description: "All neighbors"
        },
        [NeighborsSearchStatus.Online]: {
            description: "Online neighbors"
        },
        [NeighborsSearchStatus.Offline]: {
            description: "Offline neighbors"
        }
    }
})

@InputType()
export class NeighborsRequest extends PaginatedRequest {
    @IsString()
    @IsOptional()
    @Field(() => String, { nullable: true, description: "The search string" })
        searchString?: string

    @IsInt()
    @IsOptional()
    @Field(() => Int, { nullable: true, description: "The level start" })
        levelStart?: number

    @IsInt()
    @IsOptional()
    @Field(() => Int, { nullable: true, description: "The level end" })
        levelEnd?: number

    @IsEnum(NeighborsSearchStatus)
    @IsOptional()
    @Field(() => GraphQLTypeNeighborsSearchStatus, {
        nullable: true,
        description: "The search status"
    })
        status?: NeighborsSearchStatus

    @IsBoolean()
    @IsOptional()
    @Field(() => Boolean, { nullable: true, description: "The use advanced search" })
        useAdvancedSearch?: boolean
}

@ObjectType()
export class NeighborsResponse extends PaginatedResponse implements IPaginatedResponse<UserSchema> {
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}

@InputType()
export class FolloweesRequest extends PaginatedRequest {
    @Field(() => String, { nullable: true, description: "The search string" })
        searchString?: string

    @IsInt()
    @IsOptional()
    @Field(() => Int, { nullable: true, description: "The level start" })
        levelStart?: number

    @IsInt()
    @IsOptional()
    @Field(() => Int, { nullable: true, description: "The level end" })
        levelEnd?: number

    @IsEnum(NeighborsSearchStatus)
    @IsOptional()
    @Field(() => GraphQLTypeNeighborsSearchStatus, {
        nullable: true,
        description: "The search status"
    })
        status?: NeighborsSearchStatus

    @IsBoolean()
    @IsOptional()
    @Field(() => Boolean, { nullable: true, description: "The use advanced search" })
        useAdvancedSearch?: boolean
}

@ObjectType()
export class FolloweesResponse extends PaginatedResponse implements IPaginatedResponse<UserSchema> {
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}

@InputType({
    description: "The leaderboard request"
})
export class GetLeaderboardRequest {
    @IsInt()
    @Min(1)
    @Max(100)
    @Field(() => Int, { 
        description: "The limit of users to return",
        defaultValue: 10
    })
        limit: number

    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, { 
        description: "The network to get the leaderboard for",
        defaultValue: Network.Mainnet
    })
        network: Network
}

@ObjectType({
    description: "The leaderboard response"
})
export class GetLeaderboardResponse {
    @Field(() => [UserSchema], { 
        nullable: true, 
        description: "The leaderboard" 
    })
        data: Array<UserSchema>
}