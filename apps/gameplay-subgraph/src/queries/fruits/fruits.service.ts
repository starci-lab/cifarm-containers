import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { FruitId, FruitSchema, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose" // Import Connection for MongoDB

@Injectable()
export class FruitsService {
    private readonly logger = new Logger(FruitsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection // Replace DataSource with Connection
    ) {}

    async fruits(): Promise<Array<FruitSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model<FruitSchema>(FruitSchema.name)
                .find()
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async fruit(id: FruitId): Promise<FruitSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model<FruitSchema>(FruitSchema.name)
                .findById(createObjectId(id))
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
