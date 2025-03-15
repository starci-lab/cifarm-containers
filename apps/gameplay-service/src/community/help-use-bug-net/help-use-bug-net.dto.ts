import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsUUID } from "class-validator"

export class HelpUseBugNetRequest extends UserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        placedItemFruitId: string
}

export class HelpUseBugNetResponse {
    // This class is intentionally left empty for future extensions
}