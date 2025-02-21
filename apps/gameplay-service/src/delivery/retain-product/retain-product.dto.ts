import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsMongoId } from "class-validator"

export class RetainProductRequest extends UserIdRequest {
    @IsMongoId()
    @ApiProperty({ example: "60f4b3b3b3b3b3b3b3b3b3" })
        inventoryId: string
}

export class RetainProductResponse {
    // This class is intentionally left empty for future extensions
}
