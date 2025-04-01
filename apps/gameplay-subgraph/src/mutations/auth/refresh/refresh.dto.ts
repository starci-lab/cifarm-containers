import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { IResponseLike } from "@src/graphql"
import { ResponseLike } from "@src/graphql"
import { IsJWT, IsUUID } from "class-validator"

@InputType()
export class RefreshRequest {
    @IsUUID("4")
    @Field(() => String, {
        description: "Refresh token to get a new access token"
    })
        refreshToken: string
}

@ObjectType()
export class RefreshResponseData {
    @IsJWT()
    @Field(() => String, {
        description: "Access token for the user"
    })
        accessToken: string

    @IsUUID()
    @Field(() => String, {
        description: "Refresh token to get a new access token",
    })
        refreshToken: string
}

@ObjectType()
export class RefreshResponse extends ResponseLike implements IResponseLike<RefreshResponseData> {
    @Field(() => RefreshResponseData)
        data: RefreshResponseData
}
