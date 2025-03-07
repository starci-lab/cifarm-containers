import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsInt, IsMongoId } from "class-validator"

export class DeliverMoreProductRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({ example: 0 })
        index: number

    @IsMongoId()
    @ApiProperty({ example: "60f4b3b3b3b3b3b3b3b3b3b3" })
        inventoryId: string

    @IsInt()
    @ApiProperty({ example: 1 })
        quantity: number
}

export class DeliverMoreProductResponse {
}
