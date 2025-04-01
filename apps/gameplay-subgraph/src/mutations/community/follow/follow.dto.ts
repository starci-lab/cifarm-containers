import { IsMongoId } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"

@InputType()
export class FollowRequest {
    @IsMongoId()
    @Field(() => String, { description: "The user ID of the followee" })
        followeeUserId: string
}

@ObjectType()
export class FollowResponse extends ResponseLike {}
