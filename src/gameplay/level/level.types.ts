import { UserEntity } from "@src/databases"
import { EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export interface AddExperiencesParams extends EntityParams<UserEntity> {
    experiences: number
}

export type AddExperiencesResult = DeepPartial<UserEntity>

export type ComputeTotalExperienceForLevelParams = Pick<UserEntity, "level" | "experiences">