import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional } from "class-validator"
import { Network } from "@src/config"
import { BotType } from "@src/guards"

export class GenerateTestSignatureRequest {
    @IsOptional()
    @ApiProperty({ example: "avalanche" })
    chainKey?: string
    @IsOptional()
    @ApiProperty({ example: 0 })
    accountNumber?: number

    @IsOptional()
    @ApiProperty({ example: Network.Testnet })
    network?: Network
}

export class GenerateTestSignatureResponse {
    @IsOptional()
    @ApiProperty({ example: "avalanche" })
    chainKey: string

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

    @ApiProperty({ example: "testnet" })
    network: Network

    @ApiProperty({ example: "tranminhthien" })
    telegramInitDataRaw: string

    @ApiProperty({ example: BotType.Ciwallet })
    botType: BotType

    @ApiProperty({ example: "0xc0ffee" })
    accountAddress: string
}
