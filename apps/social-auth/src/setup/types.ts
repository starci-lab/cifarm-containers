import { UserSchema } from "@src/databases"
import { ClientSession } from "mongoose"

export interface SetupParams {
    user: UserSchema,
    session: ClientSession,
    // whether to create user related objects or not
    create: boolean
}

export interface SetupResponse {
    accessToken: string,
    refreshToken: string
}
