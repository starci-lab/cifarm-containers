import { IsUUID } from "class-validator"
import { ObjectType, Field } from "@nestjs/graphql"

@ObjectType()
export class RequestMessageResponse {
    @IsUUID("4")
    @Field(() => String, { description: "Message to generate signature for" })
        message: string
}
    