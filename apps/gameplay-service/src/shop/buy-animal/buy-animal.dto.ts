import { ApiProperty } from "@nestjs/swagger"
import { AnimalId } from "@src/databases"
import { Position, UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

export class BuyAnimalRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: AnimalId.Chicken, description: "The ID of the animal" })
        animalId: string

    @IsString()
    @ApiProperty({ example: "", description: "The ID of the building" })
        placedItemBuildingId: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyAnimalResponse {}
