import { IsMongoId } from "class-validator"

export class DeleteInventoryMessage {
    @IsMongoId()
        inventoryId: string
}