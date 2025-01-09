import { PostgreSQLDatabase } from "@src/env"

export interface SeederOptions {
    database?: PostgreSQLDatabase
    seedTableName?: string
}