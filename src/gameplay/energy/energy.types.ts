import { UserSchema } from "@src/databases"
import { EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export interface AddParams extends EntityParams<UserSchema> {
    energy: number
}
export type AddResult = DeepPartial<UserSchema>

export interface SubstractParams extends EntityParams<UserSchema> {
    energy: number
}

export type SubstractResult = DeepPartial<UserSchema>
