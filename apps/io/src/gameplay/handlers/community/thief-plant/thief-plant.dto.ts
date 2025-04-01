import { IsMongoId } from "class-validator"

export class ThiefPlantMessage {
    @IsMongoId()
        placedItemTileId: string
} 