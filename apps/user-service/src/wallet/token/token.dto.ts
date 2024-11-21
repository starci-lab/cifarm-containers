import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsNumber, Min } from "class-validator"

export class GetTokenBalanceRequest extends UserIdRequest {}

export class GetTokenBalanceResponse {
    @IsNumber()
    @ApiProperty({ example: 150.75, description: "The user's token balance" })
    tokens: number
}

export class AddTokenRequest extends UserIdRequest {
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example: 20.5,
        description: "The amount of tokens to add (positive value)"
    })
    tokens: number
}

export type AddTokenResponse = Empty

export class SubtractTokenRequest extends UserIdRequest {
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example: 10.25,
        description: "The amount of tokens to subtract (positive value)"
    })
    tokens: number
}

export type SubtractTokenResponse = Empty
