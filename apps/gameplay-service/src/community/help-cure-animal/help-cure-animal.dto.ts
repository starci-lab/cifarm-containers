import { ApiProperty } from "@nestjs/swagger"
import { NeighborAndUserIdRequest } from "@src/types"
import { IsUUID } from "class-validator"

export class HelpCureAnimalRequest extends NeighborAndUserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        placedItemAnimalId: string
}

export class HelpCureAnimalResponse {}