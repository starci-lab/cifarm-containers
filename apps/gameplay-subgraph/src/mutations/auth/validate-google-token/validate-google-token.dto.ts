import { IsJWT, IsString, IsUUID } from "class-validator"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"

@InputType()
export class ValidateGoogleTokenRequest {
    @IsString()
    @Field(() => String, {
        description: "Google token to validate"
    })
        token: string
}

@ObjectType()
export class ValidateGoogleTokenResponseData {
    @IsJWT()
    @Field(() => String, {
        description: "Access token"
    })
        accessToken: string

    @IsUUID()
    @Field(() => String, {
        description: "Refresh token"
    })
        refreshToken: string
}

@ObjectType()
export class ValidateGoogleTokenResponse extends ResponseLike {
    @Field(() => ValidateGoogleTokenResponseData, {
        description: "Validate google token response data"
    })
        data: ValidateGoogleTokenResponseData
}
