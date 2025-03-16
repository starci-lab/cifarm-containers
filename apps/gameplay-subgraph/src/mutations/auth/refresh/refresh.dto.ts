import { InputType, Field, ObjectType } from "@nestjs/graphql"
import { ApiProperty } from "@nestjs/swagger"
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
export class RefreshResponse {
    @IsJWT()
    @ApiProperty({
        description: "Access token for the user"
    })
        accessToken: string

    @IsUUID()
    @ApiProperty({
        description: "Refresh token to get a new access token",
    })
        refreshToken: string
}
