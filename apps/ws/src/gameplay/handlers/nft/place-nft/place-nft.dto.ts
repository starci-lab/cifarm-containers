import { Position } from "@src/databases"
import { IsMongoId, ValidateNested } from "class-validator"

export class PlaceNFTMessage {
    @IsMongoId()
        placedItemId: string
    @ValidateNested()
        position: Position  
}