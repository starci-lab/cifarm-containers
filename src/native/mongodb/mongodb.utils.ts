import { envConfig, MongoDatabase } from "@src/env"

export const getMongoDbToken = (database: MongoDatabase = MongoDatabase.Adapter) =>
    `MONGODB_${database}`

export interface CreateUriParams {
    host: string
    port: number
    dbName: string
    username?: string
    password?: string
}
export const createMongoDbUri = (database: MongoDatabase = MongoDatabase.Adapter): string => {
    const { host, port, dbName, username, password } = envConfig().databases.mongo[database]
    const auth = username && password ? `${username}:${password}@` : ""
    return `mongodb://${auth}${host}:${port}/${dbName}`
}
