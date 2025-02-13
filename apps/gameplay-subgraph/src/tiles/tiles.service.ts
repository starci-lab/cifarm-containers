import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, TileSchema } from "@src/databases"
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
            return await this.connection.model(TileSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }

    async getTile(id: string): Promise<TileSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(TileSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getTileByKey(key: string): Promise<TileSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model(TileSchema.name).findOne({ key })
        } finally {
            await mongoSession.endSession()
        }
    }
}
