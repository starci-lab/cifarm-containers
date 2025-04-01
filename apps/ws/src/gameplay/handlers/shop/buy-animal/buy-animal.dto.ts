import { AnimalId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsEnum, ValidateNested } from "class-validator"

export class BuyAnimalMessage {
    @IsEnum(AnimalId)
        animalId: AnimalId

    @ValidateNested()
    @Type(() => PositionInput)
        position: PositionInput
} 