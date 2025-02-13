import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { DeliveringProductSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetDeliveringProductsArgs extends PaginatedArgs {}

@ObjectType()
export class GetDeliveringProductsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<DeliveringProductSchema>
{
    @Field(() => [DeliveringProductSchema])
        data: Array<DeliveringProductSchema>
}
