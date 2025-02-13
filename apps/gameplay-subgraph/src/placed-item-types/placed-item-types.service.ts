import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemTypeSchema } from "@src/databases"
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
            return await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).find()
        } finally {
            await mongoSession.endSession()
        }
    }

    async getPlacedItemType(id: string): Promise<PlacedItemTypeSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getPlacedItemTypeByKey(key: string): Promise<PlacedItemTypeSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).findOne({ key })
        } finally {
            await mongoSession.endSession()
        }
    }
}
