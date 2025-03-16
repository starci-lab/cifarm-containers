import { IsMongoId } from "class-validator"
import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class SpinResponse {
    @IsMongoId()
    @Field(() => String, { description: "ID of the spin slot result" })
        spinSlotId: string
}
