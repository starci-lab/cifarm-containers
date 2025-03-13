import { ApiProperty } from "@nestjs/swagger"
import { BuildingId } from "@src/databases"
import { UserIdRequest } from "@src/common"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Position } from "@src/gameplay"

export class BuyBuildingRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: BuildingId.Barn })
        buildingId: BuildingId

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyBuildingResponse {
    // This class is intentionally left empty for future extensions
}
