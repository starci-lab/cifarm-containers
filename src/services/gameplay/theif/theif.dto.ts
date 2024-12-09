import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNumber } from "class-validator"

export class ComputeParams {
    @IsNumber()
    @ApiProperty({
        example: 0.8,
        description: "The chance of theif2 stealing"
    })
        theif2: number

    @IsNumber()
    @ApiProperty({
        example: 0.95,
        description: "The chance of theif3 stealing"
    })
        theif3: number
}

export class ComputeResult {
    @IsInt()
    @ApiProperty({
        example: 2,
        description: "The amount of stealing"
    })
        value: number
}