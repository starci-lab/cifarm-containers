import { IsMongoId } from "class-validator"

export class UseFertilizerMessage {
    @IsMongoId()
        inventorySupplyId: string
    
    @IsMongoId()
        placedItemTileId: string
} 