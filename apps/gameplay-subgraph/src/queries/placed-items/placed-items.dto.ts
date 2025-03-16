import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { PlacedItemSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetPlacedItemsArgs extends PaginatedArgs {}

@ObjectType()
export class GetPlacedItemsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<PlacedItemSchema>
{
    @Field(() => [PlacedItemSchema])
        data: Array<PlacedItemSchema>
}
