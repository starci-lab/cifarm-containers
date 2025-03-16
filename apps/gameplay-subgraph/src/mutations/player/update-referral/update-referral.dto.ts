import { Field, InputType } from "@nestjs/graphql"
import { IsMongoId } from "class-validator"

@InputType()
export class UpdateReferralRequest {
    @IsMongoId()
    @Field(() => String, { description: "The id of the referral user" })
        referralUserId: string
}