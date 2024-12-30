import { InputType } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common"

@InputType()
export class GetAnimalInfosArgs extends PaginatedArgs {}
