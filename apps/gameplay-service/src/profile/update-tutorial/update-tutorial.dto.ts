import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsInt } from "class-validator"

export class UpdateTutorialRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({ example: 1 })
        tutorialIndex: number

    @IsInt()
    @ApiProperty({ example: 1 })
        stepIndex: number
}

export class UpdateTutorialResponse {}