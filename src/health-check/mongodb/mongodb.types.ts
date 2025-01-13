import { InjectionToken } from "@src/common"
import { MongoDatabase } from "@src/env"

export interface MongoDbHealthOptions extends InjectionToken {
    database?: MongoDatabase
}