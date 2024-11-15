import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsInt, Min } from "class-validator"

export class GetGoldBalanceRequest extends UserIdRequest {}

export class GetGoldBalanceResponse {
    @IsInt()
    @ApiProperty({ example: 100, description: "The user's gold balance" })
    golds: number
}

export class GoldRequest extends UserIdRequest {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add or subtract (positive value)"
    })
    goldAmount: number
}

export class GoldResponse {
    @ApiProperty({
        example: "Operation successful",
        description: "Result message of the operation"
    })
    message: string
}
