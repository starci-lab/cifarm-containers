import { PostgreSQLOptions } from "../postgresql.types"
import { MockedImplementations, MockedDb } from "./jest.database"

export interface PostgreSQLJestOptions {
    options?: PostgreSQLOptions
    db: MockedDb
    implementations: MockedImplementations
}
