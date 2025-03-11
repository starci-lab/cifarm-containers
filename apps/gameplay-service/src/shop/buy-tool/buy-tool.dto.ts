import { ApiProperty } from "@nestjs/swagger"
import { ToolId } from "@src/databases"
import { UserIdRequest } from "@src/common"
import { IsString } from "class-validator"

export class BuyToolRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: ToolId.AnimalMedicine, description: "The ID of the tool to buy" })
        toolId: ToolId
}

export class BuyToolResponse {
    // This class is intentionally left empty for future extensions
}
