import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { UserSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"
import { IsOptional, IsString } from "class-validator"

@InputType()
export class NeighborsRequest extends PaginatedRequest {
    @IsString()
    @IsOptional()
    @Field(() => String, { nullable : true, description: "The search string" })
        searchString?: string
}

@ObjectType()
export class NeighborsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<UserSchema>
{
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}


@InputType()
export class FolloweesRequest extends PaginatedRequest {
    @Field(() => String, { nullable : true, description: "The search string" })
        searchString?: string
}

@ObjectType()
export class FolloweesResponse
    extends PaginatedResponse
    implements IPaginatedResponse<UserSchema>
{
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}
