import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Network, SupportedChainKey } from "@src/blockchain"
import { SignedMessage } from "@src/blockchain"

export class VerifySignatureRequest implements SignedMessage {
    @IsNotEmpty()
    @ApiProperty({ example: "hello world" })
        message: string
    @ApiProperty({ example: "0xD9a49b9c8df1b8Be5Ef7770EE328650B0Bcf6345" })
        publicKey: string
    @ApiProperty({
        example:
            "0x62cc52b62e31d82925e36747ed8229b583d34f2dce52dee3dcc4664c25c58cfa13f8cc15ed0bfb834646069d649ade99d12b3a67fa6a469a27b77baeaffd8b991b"
    })
        signature: string

    @IsOptional()
    @ApiProperty({ example: SupportedChainKey.Solana })
        chainKey?: SupportedChainKey

    @IsOptional()
    @ApiProperty({ example: "testnet" })
        network?: Network

    //near, aptos
    @IsOptional()
    @ApiProperty({ example: "0xab" })
        accountAddress?: string
}

export class VerifySignatureResponse {
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
