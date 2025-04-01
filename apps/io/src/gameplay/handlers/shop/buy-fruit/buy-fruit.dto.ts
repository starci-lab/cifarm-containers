import { FruitId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsEnum, ValidateNested } from "class-validator"

export class BuyFruitMessage {
    @Type(() => PositionInput)
    @ValidateNested()
        position: PositionInput
    
    @IsEnum(FruitId)
        fruitId: FruitId
}