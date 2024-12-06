import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/types"

@InputType({
    description: "GetProductArgs"
})
export class GetProductsArgs extends PaginatedArgs {}
