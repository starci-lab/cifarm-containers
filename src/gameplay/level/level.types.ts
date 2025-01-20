import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/databases"
import { EntityParams, UserIdRequest } from "@src/common"
import { IsInt } from "class-validator"
import { DeepPartial } from "typeorm"

export class GetLevelParams extends UserIdRequest {}

export class GetLevelResult {
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

export class AddExperiencesParams extends EntityParams<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
        experiences: number
}

export type AddExperiencesResult = DeepPartial<UserEntity>

export type ComputeTotalExperienceForLevelParams = Pick<UserEntity, "level" | "experiences">