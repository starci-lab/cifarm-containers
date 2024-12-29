import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType()
export class GetPlacedItemTypesArgs extends PaginatedArgs {}
