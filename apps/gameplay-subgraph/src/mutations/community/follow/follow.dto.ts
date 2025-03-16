import { IsMongoId } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class FollowRequest {
    @IsMongoId()
    @Field(() => String, { description: "The user ID of the followee" })
        followeeUserId: string
}