import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export class DeliveryJobData {
    @IsInt()
    @ApiProperty({ description: "List user id who need to sell delivering products" })
        userIds: Array<string>

    @IsInt()
    @ApiProperty({ description: "Time to deliver products" })
        utcTime: number
}
