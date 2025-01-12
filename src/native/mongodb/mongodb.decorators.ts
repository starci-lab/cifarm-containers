import { Inject } from "@nestjs/common"
import { MONGODB } from "./mongodb.constants"

export const InjectMongoDb = () => Inject(MONGODB)