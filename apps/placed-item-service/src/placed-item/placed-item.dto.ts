import { ApiProperty } from "@nestjs/swagger"
import { PlacedItemEntity } from "@src/database"
import {
    ArrayResponse,
    CreateRequest,
    CreateWithUserIdRequest,
    Empty,
    UserIdRequest
} from "@src/types"
import { IsUUID } from "class-validator"
import { DeepPartial } from "typeorm"

export class GetPlacedItemsRequest extends UserIdRequest {}
export class GetPlacedItemsResponse extends ArrayResponse<PlacedItemEntity> {}

export class GetPlacedItemRequest {
    @IsUUID()
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
    id: string
}

export class CreatePlacedItemRequest extends CreateWithUserIdRequest<PlacedItemEntity> {}

export class CreatePlacedItemResponse extends CreateRequest<PlacedItemEntity> {}

export class UpdatePlacedItemRequest {
    @IsUUID()
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
    id: string

    @ApiProperty()
    item: DeepPartial<PlacedItemEntity>
}

export type UpdatePlacedItemResponse = Empty

export class DeletePlacedItemRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
    id: string
}

export type DeletePlacedItemResponse = Empty
