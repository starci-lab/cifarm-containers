import { InputType } from "@nestjs/graphql"
import { PaginatedArgsWithUserId } from "@src/common"

@InputType({
    description: "GetDeliveringProductsArgs"
})
export class GetDeliveringProductsByUserIdArgs extends PaginatedArgsWithUserId {}
