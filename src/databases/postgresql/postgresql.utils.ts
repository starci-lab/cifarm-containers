import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { gameplayPostgreSqlEntities } from "./gameplay"
import { PostgreSQLOptions } from "./postgresql.types"
import { telegramPostgreSqlEntities } from "./telegram"

export const getPostgreSqlDataSourceName = (options: PostgreSQLOptions = {}): string => {
    const context = options.context || PostgreSQLContext.Main
    const database = options.database || PostgreSQLDatabase.Gameplay
    return `${context}_${database}`
}

export const getPostgresEntities = <T>(
    options: PostgreSQLOptions = {},
): Array<T> => {
    const { database } = options

    switch (database) {
    case PostgreSQLDatabase.Gameplay:
        return gameplayPostgreSqlEntities() as Array<T>
    case PostgreSQLDatabase.Telegram:
        return telegramPostgreSqlEntities() as Array<T>
    default:
        return []
    }
}