import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

export interface PostgreSQLOptions {
    context?: PostgreSQLContext
    database?: PostgreSQLDatabase
    cacheEnabled?: boolean
    synchronize?: boolean
    // override current context, but still use that key. Effictively for unit testing
    overrideContext?: PostgreSQLContext
}
