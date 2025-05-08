import { IsEnum, IsJWT, IsOptional, IsString, IsUUID } from "class-validator"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { ResponseLike } from "@src/graphql"
import { Network, GraphQLTypeNetwork } from "@src/env"

@InputType()
export class ValidateGoogleTokenRequest {
    @IsString()
    @Field(() => String, {
        description: "Google token to validate"
    })
        token: string

    // nullable mean auto testnet
    @IsOptional()
    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, {
        description: "Network to validate",
        nullable: true
    })
        network?: Network
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
