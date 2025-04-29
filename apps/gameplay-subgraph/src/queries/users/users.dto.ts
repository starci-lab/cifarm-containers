import { Field, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@src/common"
import { UserSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"

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
}

@ObjectType()
export class FolloweesResponse extends PaginatedResponse implements IPaginatedResponse<UserSchema> {
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}