import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsUUID, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { UserIdRequest } from "@src/types"

class Position {
    @ApiProperty({ example: 100 })
    @Type(() => Number)
    x: number

    @ApiProperty({ example: 200 })
    @Type(() => Number)
    y: number
}

export class ConstructBuildingRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: "Coop" })
    key: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
    position: Position
}

export class ConstructBuildingResponse {
    @IsString()
    @ApiProperty({ example: "placed-item-building-key" })
    placedItemBuildingKey: string
}
