import { IsMongoId } from "class-validator"

export class HelpUseWateringCanMessage {
    @IsMongoId()
        placedItemTileId: string
} 