import { IsMongoId } from "class-validator"

export class UseAnimalMedicineMessage {
    @IsMongoId()
        placedItemAnimalId: string
} 