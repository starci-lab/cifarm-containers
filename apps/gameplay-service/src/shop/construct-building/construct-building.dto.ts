import { ApiProperty, OmitType } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

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
    @ApiProperty({ example: "placed-item-id" })
    placedItemId: string
}

export class ConstructBuildingControllerRequest extends OmitType(ConstructBuildingRequest, [
    "userId"
] as const) {}
