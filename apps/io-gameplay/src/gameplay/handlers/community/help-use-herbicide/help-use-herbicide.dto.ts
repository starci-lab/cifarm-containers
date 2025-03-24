import { IsMongoId } from "class-validator"

export class HelpUseHerbicideMessage {
    @IsMongoId()
        placedItemTileId: string
} 