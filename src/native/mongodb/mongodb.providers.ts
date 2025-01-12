import { Provider } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./mongodb.module-definition"
import { MONGODB } from "./mongodb.constants"
import { ExecDockerRedisClusterService } from "@src/exec"
import { MongoClient } from "mongodb"
import { envConfig, MongoDatabase } from "@src/env"

export const createMongoDbFactoryProvider = (): Provider => ({
    provide: MONGODB,
    inject: [MODULE_OPTIONS_TOKEN, ExecDockerRedisClusterService],
    useFactory: async (
        options: typeof OPTIONS_TYPE
    ): Promise<MongoClient> => {
        const database = options.database || MongoDatabase.Adapter

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