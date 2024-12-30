import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common"

@InputType({
    description: "GetInventoryTypesArgs"
})
export class GetInventoryTypesArgs extends PaginatedArgs {}
