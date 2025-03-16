import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsUUID } from "class-validator"

export class CreatedResponse {
    @IsUUID("4")
    @ApiProperty({ example: "5a6919c3-6ae3-45de-81eb-f1bbb05a246d" })
        id: string
}

export class ArrayResponse<TEntity> {
    @ApiProperty({ type: [Object] })
        items: Array<TEntity>
}

export class CheckSufficientParams {
    @ApiProperty({ example: 50, description: "The current value (positive value)" })
        current: number

    @ApiProperty({ example: 50, description: "The required value (positive value)" })
        required: number
}

export class IdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "5a6919c3-6ae3-45de-81eb-f1bbb05a246d" })
        id: string
}

export class SocketConnectionParams  {
    @IsOptional()
    @IsString()
        clientId?: string
    @IsOptional()
    @IsUUID("4")
        userId?: string
}