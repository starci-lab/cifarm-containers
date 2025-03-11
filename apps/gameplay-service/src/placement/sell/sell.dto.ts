import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsInt, IsMongoId } from "class-validator"

export class SellRequest extends UserIdRequest {
    @IsMongoId()
    @ApiProperty({
        description: "The ID of the placed item to sell",
        example: "5f3b7c9d4f9b8c001f3f7c8b"
    })
        placedItemId: string
}

export class SellResponse {
    @IsInt()
    @ApiProperty({ example: 1000 })
        quantity: number
}