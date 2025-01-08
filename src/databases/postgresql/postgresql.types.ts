import { PostgreSQLContext, PostgreSQLDatabase } from "../databases.types"

export interface PostgreSQLOptions {
    context?: PostgreSQLContext
    database?: PostgreSQLDatabase
}

