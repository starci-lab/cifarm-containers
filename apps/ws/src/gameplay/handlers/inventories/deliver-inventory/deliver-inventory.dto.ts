import { IsInt, IsMongoId } from "class-validator"

export class DeliverInventoryMessage {
    @IsInt()
        index: number

    @IsMongoId()
        inventoryId: string

    @IsInt()
        quantity: number
} 