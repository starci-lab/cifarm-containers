import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { UserSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetNeighborsArgs extends PaginatedArgs {
    @Field(() => String, { nullable : true })
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
export class GetFolloweesArgs extends PaginatedArgs {
    @Field(() => String, { nullable : true })
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
