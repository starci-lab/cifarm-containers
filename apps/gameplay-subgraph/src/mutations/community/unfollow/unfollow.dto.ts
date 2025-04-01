import { IsUUID } from "class-validator"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"

@InputType()
export class UnfollowRequest {
    @IsUUID("4")
    @Field(() => String, { description: "The ID of the user to unfollow" })
        followeeUserId: string
}

@ObjectType()
export class UnfollowResponse extends ResponseLike {}
