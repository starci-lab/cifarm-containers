import { UserSchema } from "@src/databases"
import { DeepPartial } from "@src/common"

export interface AddExperiencesParams {
    user: DeepPartial<UserSchema>
    experiences: number
}

export type AddExperiencesResult = DeepPartial<UserSchema>

export type ComputeTotalExperienceForLevelParams = Pick<UserSchema, "level" | "experiences">