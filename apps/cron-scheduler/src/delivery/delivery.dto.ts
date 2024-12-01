import { ApiProperty } from "@nestjs/swagger"

export class DeliveryJobData {
    @ApiProperty({ description: "List user id who need to sell delivering products" })
        users: Array<string>
}
