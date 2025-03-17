import { UserSchema } from "@src/databases"

export interface AddParams {
    user: UserSchema
    amount: number
}

export type AddResult = UserSchema

export interface SubtractParams {
    user: UserSchema
    amount: number
}

export type SubtractResult = UserSchema
