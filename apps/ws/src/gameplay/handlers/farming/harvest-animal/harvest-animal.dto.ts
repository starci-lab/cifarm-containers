import { IsMongoId } from "class-validator"

export class HarvestAnimalMessage {
    @IsMongoId()
        placedItemAnimalId: string
}