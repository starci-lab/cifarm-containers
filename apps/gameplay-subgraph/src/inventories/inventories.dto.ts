import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { InventoryEntity } from "@src/databases"
import { IPaginatedResponse, PaginatedArgs, PaginatedResponse } from "@src/graphql"

@InputType()
export class GetInventoriesArgs extends PaginatedArgs {}

@ObjectType()
export class GetInventoriesResponse
    extends PaginatedResponse
    implements IPaginatedResponse<InventoryEntity>
{
    @Field(() => [InventoryEntity])
        data: Array<InventoryEntity>
}
