import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export class CropsJobData {
    @IsInt()
    @ApiProperty({ example: 1, description: "From index" })
        from: number
    @IsInt()
    @ApiProperty({ example: 10, description: "To index" })
        to: number
    @IsInt()
    @ApiProperty({ example: 1, description: "Number of crops" })
        seconds: number
}
