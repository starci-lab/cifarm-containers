import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsUUID } from "class-validator"

export class HelpWaterRequest extends UserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        placedItemTileId: string
}

export class HelpWaterResponse {
    // This class is intentionally left empty for future extensions
}