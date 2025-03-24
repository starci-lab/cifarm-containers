import { IsMongoId } from "class-validator"

export class HelpUsePesticideMessage {
    @IsMongoId()
        placedItemTileId: string
} 