import { Inject } from "@nestjs/common"
import { MongoDatabase } from "@src/env"
import { getMongoDbToken } from "./mongodb.utils"

export const InjectMongoDb = (database: MongoDatabase = MongoDatabase.Adapter) => Inject(getMongoDbToken(database))