import { IsInt, IsMongoId } from "class-validator"

export class DeliverAdditionalInventoryMessage {
    @IsMongoId()
        inventoryId: string

    @IsInt()
        quantity: number

    @IsInt()
        index: number
}
