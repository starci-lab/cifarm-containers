import { IsMongoId } from "class-validator"

export class UseAnimalFeedMessage {
    @IsMongoId()
        placedItemAnimalId: string

    @IsMongoId()
        inventorySupplyId: string
} 