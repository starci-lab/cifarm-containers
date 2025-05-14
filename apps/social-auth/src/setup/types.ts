import { UserSchema } from "@src/databases"
import { ClientSession, Connection } from "mongoose"

export interface SetupParams {
    user: UserSchema,
    session: ClientSession,
    connection: Connection,
    // whether to create user related objects or not
    create: boolean
}

export interface SetupResponse {
    accessToken: string,
    refreshToken: string
}
