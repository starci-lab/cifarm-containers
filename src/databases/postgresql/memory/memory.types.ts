import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

export interface PostgreSQLMemoryOptions {
    database?: PostgreSQLDatabase
    context?: PostgreSQLContext
}
