import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { gameplayPostgreSqlEntities } from "./gameplay"
import { PostgreSQLOptions } from "./postgresql.types"
import { telegramPostgreSqlEntities } from "./telegram"
import { getDataSourceToken } from "@nestjs/typeorm"

export const getPostgreSqlDataSourceName = (options: PostgreSQLOptions = {}): string => {
    const context = options.context || PostgreSQLContext.Main
    const database = options.database || PostgreSQLDatabase.Gameplay
    return `${context}_${database}`
}

export const getPostgreSqlToken = (options: PostgreSQLOptions = {}): string =>
    getDataSourceToken(getPostgreSqlDataSourceName(options)) as string

export const getPostgresEntities = (options: PostgreSQLOptions = {}) => {
    // define the database
    let { database } = options
    database = database || PostgreSQLDatabase.Gameplay

    // define the map
    const map = {
        [PostgreSQLDatabase.Gameplay]: gameplayPostgreSqlEntities,
        [PostgreSQLDatabase.Telegram]: telegramPostgreSqlEntities
    }
    return map[database]()
}