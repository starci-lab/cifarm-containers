import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsUUID } from "class-validator"
import { UserIdRequest } from "@src/common"

export class HarvestFruitRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        placedItemFruitId: string
}

export class HarvestFruitResponse {
    @IsInt()
    @ApiProperty({ example: 10 })
        quantity: number
}
