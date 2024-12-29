import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"

@InputType()
export class GetAnimalInfoThiefedByUsersArgs extends PaginatedArgs {}
