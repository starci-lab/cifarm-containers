import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType()
export class GetSystemsArgs extends PaginatedArgs {}
