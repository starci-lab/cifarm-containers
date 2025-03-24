import { IsMongoId } from "class-validator"

export class ThiefAnimalMessage {
    @IsMongoId()
        placedItemAnimalId: string
} 