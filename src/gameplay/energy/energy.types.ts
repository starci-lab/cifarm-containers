import { UserEntity } from "@src/databases"
import { EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export interface AddParams extends EntityParams<UserEntity> {
    energy: number
}
export type AddResult = DeepPartial<UserEntity>

export interface SubstractParams extends EntityParams<UserEntity> {
    energy: number
}

export type SubstractResult = DeepPartial<UserEntity>
