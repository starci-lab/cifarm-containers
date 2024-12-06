import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/types"

@InputType({
    description: "GetUsersArgs"
})
export class GetUsersArgs extends PaginatedArgs {}
