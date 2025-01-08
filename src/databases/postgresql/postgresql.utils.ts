import { PostgreSQLOptions } from "./postgresql.types"
import { PostgreSQLContext, PostgreSQLDatabase } from "../databases.types"

export const getDataSourceName = (options: PostgreSQLOptions = {}): string => {
    const context = options.context || PostgreSQLContext.Main
    const database = options.database || PostgreSQLDatabase.Gameplay
    return `${context}_${database}`
}
