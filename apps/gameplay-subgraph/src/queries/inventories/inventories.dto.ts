import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { InventorySchema } from "@src/databases"
import { IPaginatedResponse, PaginatedRequest, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetInventoriesRequest extends PaginatedRequest {}

@ObjectType()
export class GetInventoriesResponse
    extends PaginatedResponse
    implements IPaginatedResponse<InventorySchema>
{
    @Field(() => [InventorySchema])
        data: Array<InventorySchema>
}
