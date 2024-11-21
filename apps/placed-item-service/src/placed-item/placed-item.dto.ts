import { ApiProperty } from "@nestjs/swagger"
import { PlacedItemEntity } from "@src/database"
import { ArrayResponse, CreatedResponse, Empty, UserIdRequest } from "@src/types"
import { IsUUID } from "class-validator"
import { DeepPartial } from "typeorm"

export class GetPlacedItemsRequest extends UserIdRequest {}
export class GetPlacedItemsResponse extends ArrayResponse<PlacedItemEntity> {}

export class GetPlacedItemRequest {
    @IsUUID()
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
        id: string
}

export class CreatePlacedItemRequest extends UserIdRequest {
    @ApiProperty({
        example: {
            id: "123e4567-e89b-12d3-a456-426614174000",
            x: 1,
            y: 2,
            z: 3,
        }
    })
        placedItem: DeepPartial<PlacedItemEntity>
}

export class CreatePlacedItemResponse extends CreatedResponse {}

export class UpdatePlacedItemRequest {
    @IsUUID()
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
        id: string

    @ApiProperty()
        placedItem: DeepPartial<PlacedItemEntity>
}

export type UpdatePlacedItemResponse = Empty

export class DeletePlacedItemRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
        id: string
}

export type DeletePlacedItemResponse = Empty