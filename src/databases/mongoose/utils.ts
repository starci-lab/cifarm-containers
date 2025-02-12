import { MongoDbDatabase } from "@src/env"
import { MongooseOptions } from "./types"

export const getMongooseConnectionName = (options: MongooseOptions = {}): string => {
    const database = options.database || MongoDbDatabase.Gameplay
    return `${database}`
}