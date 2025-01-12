import { MongoDatabase } from "@src/env"

export const getMongoDbToken = (database: MongoDatabase = MongoDatabase.Adapter) => `MONGODB_${database}`