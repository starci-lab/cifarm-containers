import { UserEntity } from "@src/databases"

export type UserLike = Partial<UserEntity> & { id: string, refresh?: boolean };

export class AuthCredentials {
    accessToken: string
    refreshToken: string
}