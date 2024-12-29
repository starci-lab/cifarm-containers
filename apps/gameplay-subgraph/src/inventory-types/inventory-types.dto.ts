import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType({
    description: "GetInventoryTypesArgs"
})
export class GetInventoryTypesArgs extends PaginatedArgs {}
