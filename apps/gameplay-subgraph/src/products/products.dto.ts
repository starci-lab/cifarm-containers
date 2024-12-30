import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common"

@InputType({
    description: "GetProductArgs"
})
export class GetProductsArgs extends PaginatedArgs {}
