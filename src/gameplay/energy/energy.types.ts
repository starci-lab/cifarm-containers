import { UserSchema } from "@src/databases"
import { DeepPartial } from "@src/common"

export interface AddParams {
    user: DeepPartial<UserSchema>
    quantity: number
}
export type AddResult = DeepPartial<UserSchema>

export interface SubstractParams {
    user: DeepPartial<UserSchema>
    quantity: number
}
export type SubstractResult = DeepPartial<UserSchema>
