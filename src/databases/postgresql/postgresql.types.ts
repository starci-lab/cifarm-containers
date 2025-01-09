import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

export interface PostgreSQLOptions {
    context?: PostgreSQLContext
    database?: PostgreSQLDatabase
}

export interface PostgreSQLOptionsOptions {
    options?: PostgreSQLOptions
    injectionToken?: string
}