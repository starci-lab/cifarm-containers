import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsInt, IsNumber } from "class-validator"

export class GetBalanceRequest extends UserIdRequest {}

//x2
export class GetBalanceResponse {
    @IsInt()
    @ApiProperty({ example: 100, description: "The user's gold balance" })
    golds: number

    @IsNumber()
    @ApiProperty({ example: 100.5, description: "The user's token balance" })
    tokens: number
}

export class AddBalanceRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
    golds: number

    @IsNumber()
    @ApiProperty({
        example: 50.5,
        description: "The amount of tokens to add (positive value)"
    })
    tokens: number
}

export type AddBalanceResponse = Empty

export class SubtractBalanceRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({
        example: 50,
        description: "The amount of gold to subtract (positive value)"
    })
    golds: number

    @IsNumber()
    @ApiProperty({
        example: 50.5,
        description: "The amount of tokens to subtract (positive value)"
    })
    tokens: number
}

export type SubtractBalanceResponse = Empty
