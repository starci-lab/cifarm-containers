import { InjectConnection } from "@nestjs/mongoose"
import { getMongooseConnectionName } from "./utils"
import { MongooseOptions } from "./types"

export const InjectMongoose = (options: MongooseOptions = {}) => InjectConnection(getMongooseConnectionName(options))