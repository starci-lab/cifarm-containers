import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

export class SpeedUpRequest {
    @IsInt()
    @ApiProperty({ example: 1000 })
        time: number
}

export class SpeedUpResponse {
}
