import { InjectConnection } from "@nestjs/mongoose"
import { getMongooseConnectionName } from "./utils"
import { MongooseOptions } from "./types"

// InjectMongoose function to inject the mongoose connection based on options
export const InjectMongoose = (options: MongooseOptions = {}) => InjectConnection(getMongooseConnectionName(options))