import { Provider } from "@nestjs/common"
import { MongoClient } from "mongodb"
import { MongoDatabase } from "@src/env"
import { createMongoDbUri, getMongoDbToken } from "./mongodb.utils"

export const createMongoDbFactoryProvider = (database: MongoDatabase = MongoDatabase.Adapter): Provider => ({
    provide: getMongoDbToken(database),
    useFactory: async (): Promise<MongoClient> => {
        // Build the connection URI
        const uri = createMongoDbUri(database)
        // Return the MongoClient with the constructed URI
        return new MongoClient(uri)
    }
})