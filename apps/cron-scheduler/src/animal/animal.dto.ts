import { ApiProperty } from "@nestjs/swagger"

export class AnimalJobData {
    @ApiProperty({ example: 1, description: "From index" })
        from: number
    @ApiProperty({ example: 1, description: "To index" })
        to: number
}
