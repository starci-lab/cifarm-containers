import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { InventorySchema } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetInventoriesArgs extends PaginatedArgs {}

@ObjectType()
export class GetInventoriesResponse
    extends PaginatedResponse
    implements IPaginatedResponse<InventorySchema>
{
    @Field(() => [InventorySchema])
        data: Array<InventorySchema>
}
