import { IsMongoId } from "class-validator"

export class UseFruitFertilizerMessage {
    @IsMongoId()
        inventorySupplyId: string
    
    @IsMongoId()
        placedItemFruitId: string
} 