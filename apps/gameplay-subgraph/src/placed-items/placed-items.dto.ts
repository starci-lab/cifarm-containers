import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { PlacedItemEntity } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetPlacedItemsArgs extends PaginatedArgs {}

@ObjectType()
export class GetPlacedItemsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<PlacedItemEntity>
{
    @Field(() => [PlacedItemEntity])
        data: Array<PlacedItemEntity>
}
