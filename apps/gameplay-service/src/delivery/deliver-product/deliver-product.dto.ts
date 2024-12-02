import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsInt, IsString } from "class-validator"

export class DeliverProductRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({ example: "1" })
        index: number

    @IsString()
    @ApiProperty({ example: "f7b3b3b3-4b3b-4b3b-4b3b-4b3b4b3b4b3b" })
        inventoryId: string

    @IsInt()
    @ApiProperty({ example: "1" })
        quantity: number
}

export class DeliverProductResponse {
}
