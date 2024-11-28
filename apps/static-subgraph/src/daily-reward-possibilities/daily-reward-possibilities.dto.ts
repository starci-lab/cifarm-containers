import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/types"

@InputType()
export class GetDailyRewardPossibilitiesArgs extends PaginatedArgs {
}
