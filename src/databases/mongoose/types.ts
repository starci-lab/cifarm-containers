import { MongooseDatabase } from "@src/env"

export interface MongooseOptions {
    database?: MongooseDatabase
    // whether to use memory server for testing
    useMemoryServer?: boolean
}