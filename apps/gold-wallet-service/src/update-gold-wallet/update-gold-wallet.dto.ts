import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsInt, IsNumber } from "class-validator"

export class GoldRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({ example: 100, description: "Amount of gold" })
    goldAmount: number
}

export class GoldBalanceResponse {
    @ApiProperty({ example: 100 })
    golds: number
}

export class GoldResponse {
    @ApiProperty({ example: "Operation successful" })
    message: string
}

export class TokenRequest extends UserIdRequest {
    @IsNumber()
    @ApiProperty({ example: 10.5, description: "Amount of tokens" })
    tokenAmount: number
}

export class TokenResponse {
    @ApiProperty({ example: "Operation successful" })
    message: string
}
