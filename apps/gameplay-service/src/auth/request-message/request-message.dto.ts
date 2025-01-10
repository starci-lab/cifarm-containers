import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"

export abstract class RequestMessageRequest {
}

export class RequestMessageResponse {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        message: string
}
