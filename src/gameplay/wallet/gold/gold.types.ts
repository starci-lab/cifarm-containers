import { UserSchema } from "@src/databases"
import { DeepPartial } from "typeorm"

export interface AddParams {
    user: DeepPartial<UserSchema>
    amount: number
}

export type AddResult = DeepPartial<UserSchema>

export interface SubtractParams {
    amount: number
    user: DeepPartial<UserSchema>
}

export type SubtractResult = DeepPartial<UserSchema>
