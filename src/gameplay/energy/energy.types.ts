import { UserSchema } from "@src/databases"

export interface AddParams {
    user: UserSchema
    quantity: number
}
export type AddResult = UserSchema

export interface SubtractParams {
    user: UserSchema
    quantity: number
}
export type SubstractResult = UserSchema
