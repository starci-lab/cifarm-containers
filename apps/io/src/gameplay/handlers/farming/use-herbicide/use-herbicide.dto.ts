import { IsMongoId } from "class-validator"

export class UseHerbicideMessage {
    @IsMongoId()
        placedItemTileId: string
} 