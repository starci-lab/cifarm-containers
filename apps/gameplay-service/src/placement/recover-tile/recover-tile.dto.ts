import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { IsString } from "class-validator"

class RecoverTileRequest extends UserIdRequest {
    @ApiProperty({
        example: "uuid",
        description: "PlacedItemKey"
    })
    @IsString()
        placedItemKey:string    
    
    position: Position
}
export default RecoverTileRequest   