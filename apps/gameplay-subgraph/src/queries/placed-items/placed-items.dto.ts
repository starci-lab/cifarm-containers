import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { PlacedItemSchema } from "@src/databases"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetPlacedItemsRequest extends PaginatedRequest {}

@ObjectType()
export class GetPlacedItemsResponse
    extends PaginatedResponse
    implements IPaginatedResponse<PlacedItemSchema>
{
    @Field(() => [PlacedItemSchema])
        data: Array<PlacedItemSchema>
}
