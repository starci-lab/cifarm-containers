import { MongooseDatabase } from "@src/env"
import { MongooseOptions } from "./types"
import { getConnectionToken } from "@nestjs/mongoose"

export const getMongooseConnectionName = (options: MongooseOptions = {}): string => {
    const database = options.database || MongooseDatabase.Gameplay
    return `${database}`
}

export const getMongooseToken = (options: MongooseOptions = {}): string => {
    const connectionName = getMongooseConnectionName(options)
    return getConnectionToken(connectionName)
}