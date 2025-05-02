import { UserSchema, PlacedItemSchema } from "@src/databases"
import { ClientSession } from "mongoose"

export interface GetAssistanceChanceParams {
    assistStrength: number
}

export interface DogDefenseSuccessParams {
    neighborUser: UserSchema
    user: UserSchema
    session: ClientSession
}

export interface CatAttackSuccessParams {
    user: UserSchema
    session: ClientSession
}

export interface DogDefenseSuccessResult {
    success: boolean
    placedItemDogSnapshot?: PlacedItemSchema
    placedItemDogUpdated?: PlacedItemSchema  
}

export interface CatAttackSuccessResult {
    success: boolean
    placedItemCatSnapshot?: PlacedItemSchema
    placedItemCatUpdated?: PlacedItemSchema
    userUpdated?: UserSchema
    percentQuantityBonusAfterComputed?: number
    plusQuantityAfterComputed?: number
}
