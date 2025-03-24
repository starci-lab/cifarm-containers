import { IsMongoId } from "class-validator"

export class HarvestFruitMessage {
    @IsMongoId()
        placedItemFruitId: string
} 