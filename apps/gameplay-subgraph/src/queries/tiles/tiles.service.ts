import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, TileId, TileSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class TilesService {
    private readonly logger = new Logger(TilesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getTiles(): Promise<Array<TileSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(TileSchema.name).find().session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getTile(id: TileId): Promise<TileSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model(TileSchema.name)
                .findById(createObjectId(id))
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
