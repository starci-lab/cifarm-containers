import { ApiProperty } from "@nestjs/swagger"
import { AnimalKey } from "@src/databases"
import { UserIdRequest } from "@src/common"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Position } from "@src/gameplay"

export class BuyAnimalRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: AnimalKey.Chicken, description: "The ID of the animal" })
        animalId: AnimalKey

    @IsString()
    @ApiProperty({ example: "", description: "The ID of the building" })
        placedItemBuildingId: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyAnimalResponse {
    // This class is intentionally left empty for future extensions
}
