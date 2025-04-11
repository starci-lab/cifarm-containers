import { IsMongoId } from "class-validator"

export class RetrieveInventoryMessage {
    @IsMongoId()
        inventoryId: string
} 