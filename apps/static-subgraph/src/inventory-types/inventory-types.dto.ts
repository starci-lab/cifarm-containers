import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/types"

@InputType({
    description: "GetInventoryTypesArgs"
})
export class GetInventoryTypesArgs extends PaginatedArgs {}
