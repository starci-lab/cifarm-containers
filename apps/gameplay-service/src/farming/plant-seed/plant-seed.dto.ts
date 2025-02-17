import { ApiProperty } from "@nestjs/swagger"
import { IsMongoId } from "class-validator"
import { UserIdRequest } from "@src/common"

export class PlantSeedRequest extends UserIdRequest {
    @IsMongoId()
    @ApiProperty({ example: "2a1b2c3d4e5f6a7b8c9d0e1f" })
        inventorySeedId: string
    @IsMongoId()
    @ApiProperty({ example: "3b4c5d6e7f8a9b0c1d2e3f" })
        placedItemTileId: string
}

export class PlantSeedResponse {
    // This class is intentionally left empty for future extensions
}
