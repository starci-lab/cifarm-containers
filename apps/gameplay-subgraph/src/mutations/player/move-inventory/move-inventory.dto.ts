import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsBoolean, IsInt, IsMongoId, Min } from "class-validator"

export class MoveInventoryRequest extends UserIdRequest {
    @IsBoolean()
    @ApiProperty({ example: true })
        isTool: boolean

    @IsInt()
    @Min(0)
    @ApiProperty({ example: 1 })
        index: number

    @IsMongoId()
    @ApiProperty({ example: "60f2b4f3e0c6b8f6c1c4b7d0" })
        inventoryId: string
}

export class MoveInventoryResponse {
    // this class is intentionally left blank
}