import { IsMongoId } from "class-validator"

export class DeliverInventoryMessage {
    @IsMongoId()
        inventoryId: string
} 