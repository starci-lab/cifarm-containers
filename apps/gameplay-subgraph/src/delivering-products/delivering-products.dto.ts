import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { DeliveringProductEntity } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetDeliveringProductsArgs extends PaginatedArgs {}

@ObjectType()
export class GetDeliveringProductsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<DeliveringProductEntity>
{
    @Field(() => [DeliveringProductEntity])
        data: Array<DeliveringProductEntity>
}
