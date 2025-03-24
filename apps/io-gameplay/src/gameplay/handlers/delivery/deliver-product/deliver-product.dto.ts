import { IsInt, IsMongoId } from "class-validator"

export class DeliverProductMessage {
    @IsInt()
        index: number

    @IsMongoId()
        inventoryId: string

    @IsInt()
        quantity: number
} 