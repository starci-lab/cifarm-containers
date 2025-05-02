import { IsMongoId } from "class-validator"

export class SelectCatMessage {
    @IsMongoId()
        placedItemPetId: string
}