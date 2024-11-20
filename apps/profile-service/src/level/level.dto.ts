import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsInt } from "class-validator"

export class GetLevelRequest extends UserIdRequest {}

export class GetLevelResponse {
    @IsInt()
    @ApiProperty({ example: 5, description: "The user's level" })
    level: number

    @IsInt()
    @ApiProperty({ example: 100, description: "The user's experiences" })
    experiences: number

    @IsInt()
    @ApiProperty({ example: 100, description: "The user's experience quota" })
    experienceQuota: number
}

export class AddExperiencesRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
    experiences : number
}

export type AddExperiencesResponse = Empty