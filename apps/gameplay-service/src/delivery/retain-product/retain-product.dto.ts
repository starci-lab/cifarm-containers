import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsString } from "class-validator"

export class RetainProductRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({ example: "f7b3b3b3-4b3b-4b3b-4b3b-4b3b4b3b4b3b" })
        deliveringProductId: string
}

export class RetainProductResponse {
    // Empty
}
