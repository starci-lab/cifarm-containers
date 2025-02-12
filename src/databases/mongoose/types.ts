import { MongoDbDatabase } from "@src/env"

export interface MongooseOptions {
    database?: MongoDbDatabase
    // whether to use memory server for testing
    useMemoryServer?: boolean
}