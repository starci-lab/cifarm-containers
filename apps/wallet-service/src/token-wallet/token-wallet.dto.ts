import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsNumber, Min } from "class-validator"

export class GetTokenBalanceRequest extends UserIdRequest {}

export class GetTokenBalanceResponse {
    @IsNumber()
    @ApiProperty({ example: 100.5, description: "The user's token balance" })
    tokens: number
}

export class TokenRequest extends UserIdRequest {
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example: 10.5,
        description: "The amount of tokens to add or subtract (positive value)"
    })
    tokenAmount: number
}

export class TokenResponse {
    @ApiProperty({
        example: "Operation successful",
        description: "Result message of the operation"
    })
    message: string
}
