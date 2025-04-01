import { IsMongoId } from "class-validator"

export class RetainInventoryMessage {
    @IsMongoId()
        inventoryId: string
} 