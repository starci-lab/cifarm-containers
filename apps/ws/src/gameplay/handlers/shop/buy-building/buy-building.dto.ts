import { BuildingId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsEnum, ValidateNested } from "class-validator"

export class BuyBuildingMessage {
    @IsEnum(BuildingId)
        buildingId: BuildingId

    @ValidateNested()
    @Type(() => PositionInput)
        position: PositionInput
} 