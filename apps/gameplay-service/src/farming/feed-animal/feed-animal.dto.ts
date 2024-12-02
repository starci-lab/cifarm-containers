import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { UserIdRequest } from "@src/types"

export class FeedAnimalRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        placedItemAnimalId: string

    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        inventoryAnimalFeedId: string
}

export class FeedAnimalResponse {}
