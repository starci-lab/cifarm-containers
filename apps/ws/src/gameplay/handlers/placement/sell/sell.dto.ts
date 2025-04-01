import { IsMongoId } from "class-validator"

export class SellMessage {
    @IsMongoId()
        placedItemId: string
}