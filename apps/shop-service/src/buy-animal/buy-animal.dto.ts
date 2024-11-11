import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsUUID, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

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
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        userId: string

    @IsString()
    @ApiProperty({ example: "animal_12345" })
        animalKey: string

    @IsString()
    @ApiProperty({ example: "building_67890" })
        placedItemBuildingKey: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyAnimalResponse {
    @IsString()
    @ApiProperty({ example: "placed_item_animal_54321" })
        placedItemAnimalKey: string
}
