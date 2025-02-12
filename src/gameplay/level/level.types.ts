import { UserSchema } from "@src/databases"
import { EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export interface AddExperiencesParams extends EntityParams<UserSchema> {
    experiences: number
}

export type AddExperiencesResult = DeepPartial<UserSchema>

export type ComputeTotalExperienceForLevelParams = Pick<UserSchema, "level" | "experiences">