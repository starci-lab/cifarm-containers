import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsString } from "class-validator"

export class CollectAnimalProductRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: "placed-item-animal-id" })
        placedItemAnimalId: string
}

export class CollectAnimalProductResponse {
    @IsString()
    @ApiProperty({ example: "inventory-animal-product-id" })
        inventoryAnimalProductId: string
}
