import { PetId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsEnum, ValidateNested } from "class-validator"

export class BuyPetMessage {
    @IsEnum(PetId)
        petId: PetId

    @ValidateNested()
    @Type(() => PositionInput)
        position: PositionInput
} 