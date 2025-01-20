import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNumber } from "class-validator"

export class ComputeParams {
    @IsNumber()
    @ApiProperty({
        example: 0.8,
        description: "The chance of thief2 stealing"
    })
        thief2: number

    @IsNumber()
    @ApiProperty({
        example: 0.95,
        description: "The chance of thief3 stealing"
    })
        thief3: number
}

export class ComputeResult {
    @IsInt()
    @ApiProperty({
        example: 2,
        description: "The amount of stealing"
    })
        value: number
}