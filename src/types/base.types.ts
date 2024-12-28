import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export type Empty = Record<string, never>

export interface HttpResponse<TData = undefined> {
    message: string
    data?: TData
}

export interface TransactionResult {
    transactionHash: string
}

export interface TransactionHttpResponseData {
    transactionHash: string
}

export type Atomic = string | number | boolean | object

export class Position {
    @IsInt()
    @ApiProperty({ example: 1, description: "X coordinate" })
        x: number

    @IsInt()
    @ApiProperty({ example: 1, description: "Y coordinate" })
        y: number
}