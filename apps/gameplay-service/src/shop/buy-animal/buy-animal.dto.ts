import { ApiProperty } from "@nestjs/swagger"
import { AnimalId } from "@src/database"
import { Position, UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

export class BuyAnimalRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: AnimalId.Chicken, description: "The ID of the animal" })
        id: string

    @IsString()
    @ApiProperty({ example: "", description: "The ID of the building" })
        placedItemBuildingId: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyAnimalResponse {
    @IsString()
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "The ID of the placed item"
    })
        placedItemId: string
}
