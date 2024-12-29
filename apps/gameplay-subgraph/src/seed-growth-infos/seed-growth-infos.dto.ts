import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType()
export class GetSeedGrowthInfosArgs extends PaginatedArgs {}
