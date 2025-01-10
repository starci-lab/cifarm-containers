import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsString } from "class-validator"

export class CollectAnimalProductRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: "placed-item-animal-id" })
        placedItemAnimalId: string
}

export class CollectAnimalProductResponse {
    // Empty
}
