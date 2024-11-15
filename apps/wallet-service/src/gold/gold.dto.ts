import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsInt, Min } from "class-validator"

export class GetGoldBalanceRequest extends UserIdRequest {}

export class GetGoldBalanceResponse {
    @IsInt()
    @ApiProperty({ example: 100, description: "The user's gold balance" })
    golds: number
}

export class AddGoldRequest extends UserIdRequest {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
    golds: number
}

export type AddGoldResponse = Empty

export class SubtractGoldRequest extends UserIdRequest {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to subtract (positive value)"
    })
    golds: number
}

export type SubtractGoldResponse = Empty
