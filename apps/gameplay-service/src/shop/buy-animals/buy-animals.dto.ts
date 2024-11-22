import { ApiProperty, OmitType } from "@nestjs/swagger"
import { IsString, IsUUID, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { AnimalId, BuildingId } from "@src/database"

class Position {
    @ApiProperty({ example: 100 })
    @IsString()
    x: number

    @ApiProperty({ example: 200 })
    @IsString()
    y: number
}

export class BuyAnimalRequest {
    @IsUUID(4)
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "The ID of the user"
    })
    userId: string

    @IsString()
    @ApiProperty({ example: AnimalId.Chicken, description: "The ID of the animal" })
    id: string

    @IsString()
    @ApiProperty({ example: BuildingId.Coop, description: "The ID of the building" })
    buildingId: string

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

export class BuyAnimalControllerRequest extends OmitType(BuyAnimalRequest, ["userId"]) {}
