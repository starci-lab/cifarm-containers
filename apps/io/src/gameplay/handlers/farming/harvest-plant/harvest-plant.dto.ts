import { IsMongoId } from "class-validator"

export class HarvestPlantMessage {
    @IsMongoId()
        placedItemTileId: string
} 