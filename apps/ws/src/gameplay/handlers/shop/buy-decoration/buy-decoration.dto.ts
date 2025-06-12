import { DecorationId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsEnum, ValidateNested } from "class-validator"

export class BuyDecorationMessage {
    @IsEnum(DecorationId)
        decorationId: DecorationId

    @ValidateNested()
    @Type(() => PositionInput)
        position: PositionInput
} 