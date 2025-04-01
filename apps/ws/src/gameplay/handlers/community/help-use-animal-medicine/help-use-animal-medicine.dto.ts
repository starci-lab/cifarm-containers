import { IsMongoId } from "class-validator"

export class HelpUseAnimalMedicineMessage {
    @IsMongoId()
        placedItemAnimalId: string
} 