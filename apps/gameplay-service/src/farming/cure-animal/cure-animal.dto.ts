import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { Empty, UserIdRequest } from "@src/types"

export class CureAnimalRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        placedItemAnimalId: string
}

export type CureAnimalResponse = Empty
