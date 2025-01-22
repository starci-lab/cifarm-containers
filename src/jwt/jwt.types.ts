import { BaseOptions } from "@src/common"
import { UserEntity } from "@src/databases"

export type UserLike = Partial<UserEntity> & { id: string, refresh?: boolean };

export interface AuthCredentials {
    accessToken: string
    refreshToken: RefreshToken
}

export interface RefreshToken {
    token: string
    expiredAt: Date
}

export type JwtOptions = BaseOptions

export enum AuthCredentialType {
    AccessToken = "accessToken",
    RefreshToken = "refreshToken"
}