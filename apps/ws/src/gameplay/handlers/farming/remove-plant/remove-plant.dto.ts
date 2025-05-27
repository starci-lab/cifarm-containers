import { IsMongoId } from "class-validator"

export class RemovePlantMessage {
    @IsMongoId()
        placedItemTileId: string
} 