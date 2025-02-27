import { ApiProperty } from "@nestjs/swagger"
import { EdgeTxResponse } from "@src/honeycomb"
import { IsInt, IsString, Min } from "class-validator"

export class TxResponse implements EdgeTxResponse {
    @IsString()
    @ApiProperty()
        transaction: string
    @IsString()
    @ApiProperty()
        blockhash: string
    @IsInt()
    @Min(0)
    @ApiProperty()
        lastValidBlockHeight: number
}