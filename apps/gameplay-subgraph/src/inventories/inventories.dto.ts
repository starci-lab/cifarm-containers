import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common"

@InputType({
    description: "GetInventoriesArgs"
})
export class GetInventoriesArgs extends PaginatedArgs {}
