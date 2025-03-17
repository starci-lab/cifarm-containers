import { UserSchema } from "@src/databases"

export interface AddExperiencesParams {
    user: UserSchema
    experiences: number
}

export type AddExperiencesResult = UserSchema
export type ComputeTotalExperienceForLevelParams = Pick<UserSchema, "level" | "experiences">