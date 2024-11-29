import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/types"

@InputType({
    description: "GetUpgradesArgs"
})
export class GetUpgradesArgs extends PaginatedArgs {}
