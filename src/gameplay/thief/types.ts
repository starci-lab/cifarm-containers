import { UserSchema } from "@src/databases"

export interface ComputeResult {
    value: number
}

export type ComputeAnimalResult = ComputeResult

export type ComputeCropResult = ComputeResult

export type ComputeFruitResult = ComputeResult

export type ComputeBeeHouseResult = ComputeResult
export type ComputeFlowerResult = ComputeResult

export interface CheckLevelGapParams {
    user: UserSchema
    neighbor: UserSchema
}