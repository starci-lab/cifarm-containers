import { ApiProperty } from "@nestjs/swagger"
import { CropEntity } from "@src/database"
import { ArrayResponse, CreatedResponse, CreateRequest, Empty } from "@src/types"
import { IsString } from "class-validator"
import { DeepPartial } from "typeorm"

// GetCrops
export class GetCropsResponse extends ArrayResponse<CropEntity> {}

// GetCrop
export class GetCropRequest {
    id: string
}

export class GetCropResponse extends CropEntity {}

// CreateCrop ussing deep partial

export class CreateCropRequest extends CreateRequest<CropEntity> {}

export class CreateCropResponse extends CreatedResponse {}

export class UpdateCropRequest {
    @IsString()
    @ApiProperty({ example: "Carrot", description: "The key of the crop" })
    id: string

    item: DeepPartial<CropEntity>
}

export type UpdateCropResponse = Empty

// DeleteCrop
export class DeleteCropRequest {
    id: string
}
export type DeleteCropResponse = Empty
