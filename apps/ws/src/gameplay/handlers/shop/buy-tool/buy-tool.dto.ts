import { ToolId } from "@src/databases"
import { IsEnum } from "class-validator"

export class BuyToolMessage {
    @IsEnum(ToolId)
        toolId: ToolId
} 