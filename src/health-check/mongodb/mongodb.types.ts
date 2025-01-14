import { BaseOptions } from "@src/common"
import { MongoDatabase } from "@src/env"

export interface MongoDbHealthOptions extends BaseOptions {
    database?: MongoDatabase
}