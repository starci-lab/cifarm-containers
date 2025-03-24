import { IsInt, IsMongoId } from "class-validator"

export class DeliverMoreProductMessage {
    @IsMongoId()
        inventoryId: string

    @IsInt()
        quantity: number

    @IsInt()
        index: number
}
