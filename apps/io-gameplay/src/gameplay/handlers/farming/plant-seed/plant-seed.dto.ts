import { IsMongoId } from "class-validator"

export class PlantSeedMessage {
    @IsMongoId()
        inventorySeedId: string
    
    @IsMongoId()
        placedItemTileId: string
} 