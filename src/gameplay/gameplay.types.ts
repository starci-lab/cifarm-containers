import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export class Position {
    @IsInt()
    @ApiProperty({ example: 1, description: "X coordinate" })
        x: number

    @IsInt()
    @ApiProperty({ example: 1, description: "Y coordinate" })
        y: number
}