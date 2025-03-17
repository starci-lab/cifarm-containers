import { UserSchema } from "@src/databases"

export interface AddParams {
    user: UserSchema
    quantity: number
}
export type AddResult = UserSchema

export interface SubstractParams {
    user: UserSchema
    quantity: number
}
export type SubstractResult = UserSchema
