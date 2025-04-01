import { SupplyId } from "@src/databases"
import { IsEnum, IsInt, Min } from "class-validator"

export class BuySuppliesMessage {
    @IsEnum(SupplyId)
        supplyId: SupplyId

    @IsInt()
    @Min(1)
        quantity: number
} 