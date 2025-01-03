import { InputType } from "@nestjs/graphql"
import { PaginatedArgs, PaginatedArgsWithUserId } from "@src/common"

@InputType({
    description: "GetInventoriesArgs"
})
export class GetInventoriesArgs extends PaginatedArgs {}

export class GetInventoriesByUserIdArgs extends PaginatedArgsWithUserId {}
