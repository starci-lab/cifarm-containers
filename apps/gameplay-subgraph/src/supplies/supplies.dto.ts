import { InputType } from "@nestjs/graphql"
import { IdArgs, PaginatedArgs } from "@src/graphql"

@InputType()
export class GetSuppliesArgs extends PaginatedArgs {}

@InputType()
export class GetSupplyArgs extends IdArgs {}