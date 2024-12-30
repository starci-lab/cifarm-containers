import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsString } from "class-validator"

export class UpgradeBuildingRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: "placed-item-id" })
        placedItemId: string

}

export class UpgradeBuildingResponse {}
