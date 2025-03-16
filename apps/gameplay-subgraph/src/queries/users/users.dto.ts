import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { UserSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetNeighborsRequest extends PaginatedRequest {
    @Field(() => String, { nullable : true, description: "The search string" })
        searchString?: string
}

@ObjectType()
export class GetNeighborsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<UserSchema>
{
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}


@InputType()
export class GetFolloweesRequest extends PaginatedRequest {
    @Field(() => String, { nullable : true, description: "The search string" })
        searchString?: string
}

@ObjectType()
export class GetFolloweesResponse
    extends PaginatedResponse
    implements IPaginatedResponse<UserSchema>
{
    @Field(() => [UserSchema])
        data: Array<UserSchema>
}
