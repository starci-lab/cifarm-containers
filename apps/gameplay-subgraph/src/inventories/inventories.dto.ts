import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType({
    description: "GetInventoriesArgs"
})
export class GetInventoriesArgs extends PaginatedArgs {}
