import { UserSchema } from "@src/databases"
import { ClientSession, Connection } from "mongoose"

export interface InitializeParams {
    user: UserSchema,
    session: ClientSession,
    connection: Connection
}

export interface InitializeResponse {
    accessToken: string,
    refreshToken: string
}
