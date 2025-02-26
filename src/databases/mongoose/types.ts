import { MongoDatabase } from "@src/env"

export interface MongooseOptions {
    database?: MongoDatabase
    // whether to use memory server for testing
    useMemoryServer?: boolean
}