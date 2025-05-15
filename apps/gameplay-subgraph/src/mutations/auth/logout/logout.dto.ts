import { Field, ObjectType, InputType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"
import { IsString } from "class-validator"
import { IsNotEmpty } from "class-validator"

@InputType()
export class LogoutRequest {
    @Field(() => String, { description: "Refresh token to invalidate" })
    @IsNotEmpty()
    @IsString()
        refreshToken: string
}

@ObjectType({
    description: "Logout Response"
})
export class LogoutResponse extends ResponseLike {}
