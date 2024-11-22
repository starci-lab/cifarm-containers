import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

export class ConstructBuildingRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: "Coop" })
    id: string

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
