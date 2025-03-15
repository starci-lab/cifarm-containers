import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export class FruitJobData {
    @IsInt()
    @ApiProperty({ example: 0, description: "Number of items to skip in the paginated request" })
        skip: number

    @IsInt()
    @ApiProperty({ example: 5, description: "Number of items to take in the paginated request" })
        take: number

    @IsInt()
    @ApiProperty({ example: 1, description: "Seconds to grow" })
        time: number

    @IsInt()
    @ApiProperty({ example: 1, description: "Time to grow" })
        utcTime: number
}
