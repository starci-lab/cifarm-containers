import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class RefreshRequest {
    @IsString()
    @ApiProperty({
        example: "dQp9skJW9T3RxPBXNvx7mPR-XHRPL6sFzjVkj_8gnto", // Example JWT refresh token
        description: "Refresh token to get a new access token"
    })
        refreshToken: string
}

export class RefreshResponse {
    @IsString()
    @ApiProperty({
        example:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJteS1hcGkiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.CYKMzt2MB-2Ez0N5D93tnPYznZy2ym2NKd5XK_UQeLQ", // Example JWT access token
        description: "Access token for the user"
    })
        accessToken: string

    @IsString()
    @ApiProperty({
        example: "dQp9skJW9T3RxPBXNvx7mPR-XHRPL6sFzjVkj_8gnto", // Example JWT refresh token
        description: "Refresh token to get a new access token"
    })
        refreshToken: string
}
