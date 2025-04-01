import { IsBoolean, IsInt, IsMongoId } from "class-validator"

export class MoveInventoryMessage {
    @IsBoolean()
        isTool: boolean

    @IsInt()
        index: number

    @IsMongoId()
        inventoryId: string
}