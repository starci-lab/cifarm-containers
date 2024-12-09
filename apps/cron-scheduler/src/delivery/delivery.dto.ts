import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export class DeliveryJobData {
    @IsInt()
    @ApiProperty({ description: "Time to deliver products" })
        utcTime: number

    @IsInt()
    @ApiProperty({ description: "Skip number" })
        skip: number

    @IsInt()
    @ApiProperty({ description: "Take number" })
        take: number
}
