import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, PlacedItemTypeId, PlacedItemTypeSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class PlacedItemTypesService {
    private readonly logger = new Logger(PlacedItemTypesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getPlacedItemTypes(): Promise<Array<PlacedItemTypeSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                .find()
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getPlacedItemType(id: PlacedItemTypeId): Promise<PlacedItemTypeSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                .findById(createObjectId(id))
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}
