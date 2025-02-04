import { ApiProperty } from "@nestjs/swagger"
import { BuildingId } from "@src/databases"
import { UserIdRequest } from "@src/common"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Position } from "@src/gameplay"

export class ConstructBuildingRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: BuildingId.Barn })
        buildingId: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class ConstructBuildingResponse {
    // This class is intentionally left empty for future extensions
}
