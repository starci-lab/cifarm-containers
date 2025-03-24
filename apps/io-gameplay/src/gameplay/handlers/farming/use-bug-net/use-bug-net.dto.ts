import { IsMongoId } from "class-validator"

export class UseBugNetMessage {
    @IsMongoId()
        placedItemFruitId: string
} 