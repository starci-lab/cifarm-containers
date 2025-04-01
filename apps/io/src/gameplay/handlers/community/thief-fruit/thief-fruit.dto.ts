import { IsMongoId } from "class-validator"

export class ThiefFruitMessage {
    @IsMongoId()
        placedItemFruitId: string
} 