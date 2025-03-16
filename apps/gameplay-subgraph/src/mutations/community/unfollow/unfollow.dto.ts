import { IsUUID } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class UnfollowRequest {
    @IsUUID("4")
    @Field(() => String, { description: "The ID of the user to unfollow" })
        followeeUserId: string
}