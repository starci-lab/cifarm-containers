import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsString, IsUUID } from "class-validator"

export class RecoverTileRequest extends UserIdRequest {
    @ApiProperty({
        example: "uuid",
        description: "PlacedItemKey"
    })
    @IsString()
        placedItemTileId:string    
    
}

export class RecoverTileResponse {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        inventoryTileId: string
}