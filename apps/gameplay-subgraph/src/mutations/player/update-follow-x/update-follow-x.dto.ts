import { ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"

@ObjectType({
    description: "Update follow X response"
})
export class UpdateFollowXResponse extends ResponseLike {}

