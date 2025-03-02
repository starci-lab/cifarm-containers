import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { UserIdRequest } from "@src/common"

export class UseFertilizerRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        inventorySupplyId: string
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        placedItemTileId: string
}

export class UseFertilizerResponse {
    // This class is intentionally left empty for future extensions
}
