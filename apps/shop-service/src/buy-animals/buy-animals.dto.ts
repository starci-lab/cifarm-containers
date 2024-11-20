import { ApiProperty, OmitType } from "@nestjs/swagger"
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

export class BuyAnimalsRequest {
    @IsUUID(4)
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
    userId: string

    @IsString()
    @ApiProperty({ example: "Chicken" })
    key: string

    @IsString()
    @ApiProperty({ example: "Coop" })
    buildingKey: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
    position: Position
}

export class BuyAnimalsResponse {
    @IsString()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
    placedItemAnimalKey: string
}

export class BuyAnimalsControllerRequest extends OmitType(BuyAnimalsRequest, ["userId"]) {}
