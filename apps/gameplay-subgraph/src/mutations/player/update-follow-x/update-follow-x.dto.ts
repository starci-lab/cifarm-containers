import { ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"

@ObjectType()
export class UpdateFollowXResponse extends ResponseLike {}

