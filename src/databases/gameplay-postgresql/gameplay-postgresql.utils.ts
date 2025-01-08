import { envConfig } from "@src/env"
import { DatabaseContext, TypeORMConfig } from "../databases.types"

export const contextMap = (): Record<DatabaseContext, TypeORMConfig> => ({
    [DatabaseContext.Main]: {
        host: envConfig().databases.postgresql.gameplay[DatabaseContext.Main].host,
        port: envConfig().databases.postgresql.gameplay[DatabaseContext.Main].port,
        username: envConfig().databases.postgresql.gameplay[DatabaseContext.Main].username,
        password: envConfig().databases.postgresql.gameplay[DatabaseContext.Main].password,
        database: envConfig().databases.postgresql.gameplay[DatabaseContext.Main].dbName
    },
    [DatabaseContext.Mock]: {
        host: envConfig().databases.postgresql.gameplay[DatabaseContext.Mock].host,
        port: envConfig().databases.postgresql.gameplay[DatabaseContext.Mock].port,
        username: envConfig().databases.postgresql.gameplay[DatabaseContext.Mock].username,
        password: envConfig().databases.postgresql.gameplay[DatabaseContext.Mock].password,
        database: envConfig().databases.postgresql.gameplay[DatabaseContext.Mock].dbName
    }
})
