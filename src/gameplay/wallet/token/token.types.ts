import { UserSchema } from "@src/databases"
import { DeepPartial } from "@src/common"

export interface AddParams {
    user: DeepPartial<UserSchema>
    amount: number
}

export type AddResult = DeepPartial<UserSchema>

export interface SubtractParams {
    user: DeepPartial<UserSchema>
    amount: number
}

export type SubtractResult = DeepPartial<UserSchema>
