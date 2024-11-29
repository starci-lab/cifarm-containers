import { ApiProperty } from "@nestjs/swagger"
import { Empty } from "@src/types"
import { IsInt } from "class-validator"

export class SpeedUpRequest {
    @IsInt()
    @ApiProperty({ example: 1000 })
        time: number
}

export type SpeedUpResponse = Empty
