import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { IsMongoId } from "class-validator"
import { ResponseLike } from "@src/graphql"

@InputType()
export class UpdateReferralRequest {
    @IsMongoId()
    @Field(() => String, { description: "The id of the referral user" })
        referralUserId: string
}

@ObjectType()
export class UpdateReferralResponse extends ResponseLike {}

