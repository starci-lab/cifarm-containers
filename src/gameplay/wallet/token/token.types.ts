import { UserEntity } from "@src/databases"
import { EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export interface AddParams extends EntityParams<UserEntity> {
    amount: number
}

export type AddResult = DeepPartial<UserEntity>

export interface SubtractParams extends EntityParams<UserEntity> {
    amount: number
}

export type SubtractResult = DeepPartial<UserEntity>
