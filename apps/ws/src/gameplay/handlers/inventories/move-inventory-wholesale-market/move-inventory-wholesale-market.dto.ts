import { IsBoolean, IsInt, IsMongoId } from "class-validator"

export class MoveInventoryWholesaleMarketMessage {
    @IsBoolean()
        isTool: boolean

    @IsInt()
        index: number

    @IsMongoId()
        inventoryId: string
}