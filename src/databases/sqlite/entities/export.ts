import { AbstractEntity } from "./abstract"
import { GameplayPostgreSQLEntity } from "./gameplay-postgresql.entity"
import { ConfigEntity } from "./config.entity"
import { TelegramUserTrackerPostgreSQLEntity } from "./telegram-user-tracker-postgresql.entity"

export const cliSqliteEnties = () : Array<typeof AbstractEntity> => ([
    GameplayPostgreSQLEntity,
    ConfigEntity,
    TelegramUserTrackerPostgreSQLEntity
])