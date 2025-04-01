import { IsMongoId } from "class-validator"

export class HelpUseBugNetMessage {
    @IsMongoId()
        placedItemFruitId: string
} 