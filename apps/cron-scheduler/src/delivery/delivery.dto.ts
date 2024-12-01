import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsInt } from "class-validator"

export class DeliveryJobData {
    @IsArray()
    @ApiProperty({ example: [
        "0f0f9f1c-b1b3-4e92-9f27-4538b7c520f0", 
        "2e0f9f1c-b1b3-4e92-9f27-4538b7c520f0"
    ], description: "User ids" })
        userIds: Array<string>

    @IsInt()
    @ApiProperty({ description: "Time to deliver products" })
        utcTime: number
}
