import { IsMongoId } from "class-validator"

export class SelectDogMessage {
    @IsMongoId()
        placedItemPetId: string
}