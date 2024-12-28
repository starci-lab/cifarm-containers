import { ApiProperty } from "@nestjs/swagger"
import { BuildingId } from "@src/databases"
import { Position, UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

export class ConstructBuildingRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: BuildingId.Pasture })
        buildingId: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class ConstructBuildingResponse {}
