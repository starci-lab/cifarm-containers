import { Position } from "@src/databases"
import { IsMongoId, ValidateNested } from "class-validator"

export class MoveMessage {
    @IsMongoId()
        placedItemId: string

    @ValidateNested()
        position: Position
}