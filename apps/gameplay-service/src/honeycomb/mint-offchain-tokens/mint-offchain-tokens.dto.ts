import { UserIdRequest } from "@src/common"
import { TxResponse } from "../types"
import { IsInt, IsPositive } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class MintOffchainTokensRequest extends UserIdRequest {
    @IsInt()
    @IsPositive()
    @ApiProperty({ example: 10 })
        amount: number
}

export class MintOffchainTokensResponse extends TxResponse {
    // this class is intentionally left blank
}