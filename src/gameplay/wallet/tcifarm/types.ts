import { UserSchema } from "@src/databases"

export interface AddParams {
    user: UserSchema
    amount: number
}

export type AddResult = UserSchema

export interface SubtractParams {
    amount: number
    user: UserSchema
}

export type SubtractResult = UserSchema
