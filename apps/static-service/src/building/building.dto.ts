import { ApiProperty } from "@nestjs/swagger"
import { BuildingEntity } from "@src/database"
import { ArrayResponse, CreatedResponse, CreateRequest, Empty } from "@src/types"
import { IsString } from "class-validator"
import { DeepPartial } from "typeorm"

export class GetBuildingsResponse extends ArrayResponse<BuildingEntity> {}

export class GetBuildingRequest {
    id: string
}

export class GetBuildingResponse extends BuildingEntity {}

export class CreateBuildingRequest extends CreateRequest<BuildingEntity> {}

export class CreateBuildingResponse extends CreatedResponse {}

export class UpdateBuildingRequest {
    @IsString()
    @ApiProperty({ example: "pasture", description: "The key of the Building" })
    id: string

    item: DeepPartial<BuildingEntity>
}

export type UpdateBuildingResponse = Empty

export class DeleteBuildingRequest {
    id: string
}
export type DeleteBuildingResponse = Empty
