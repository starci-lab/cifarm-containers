import { AbstractEntity } from "./abstract"
import { GameplayPostgreSQLEntity } from "./gameplay-postgresql.entity"
import { ConfigEntity } from "./config.entity"

export const cliSqliteEnties = () : Array<typeof AbstractEntity> => ([
    GameplayPostgreSQLEntity,
    ConfigEntity
])