import { IsEnum, IsJWT, IsOptional, IsUUID } from "class-validator"
import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { GraphQLTypeNetwork, Network } from "@src/env"
import { ResponseLike } from "@src/graphql"
import { IsGoogleOauthToken } from "@src/validators"

@InputType()
export class AuthenticateGoogleRequest {
    @IsOptional()
    @IsEnum(Network)
    @Field(() => GraphQLTypeNetwork, {
        description: "Network (Testnet or Mainnet)",
        nullable: true,
    })
        network?: Network

    @IsGoogleOauthToken()
    @Field(() => String, {
        description: "Google token"
    })
        token: string
}

@ObjectType()
export class AuthenticateGoogleResponseData {
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
export class AuthenticateGoogleTokenResponse extends ResponseLike {
    @Field(() => AuthenticateGoogleResponseData, {
        description: "Validate google token response data"
    })
        data: AuthenticateGoogleResponseData
}
