import { Provider } from "@nestjs/common"
import { MongoClient } from "mongodb"
import { envConfig, MongoDatabase } from "@src/env"
import { getMongoDbToken } from "./mongodb.utils"

export const createMongoDbFactoryProvider = (database: MongoDatabase = MongoDatabase.Adapter): Provider => ({
    provide: getMongoDbToken(database),
    useFactory: async (): Promise<MongoClient> => {
        // Build the connection URI
        const mongodbConfig = envConfig().databases.mongo[database]
        const { host, port, dbName, username, password } = mongodbConfig

        // If username and password are provided, include them in the URI
        const auth = username && password ? `${username}:${password}@` : ""

        const uri = `mongodb://${auth}${host}:${port}/${dbName}`

        // Return the MongoClient with the constructed URI
        return new MongoClient(uri)
    }
})