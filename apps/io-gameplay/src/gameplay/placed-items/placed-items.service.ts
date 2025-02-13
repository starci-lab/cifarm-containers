import { Injectable } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { GetPlacedItemsParams } from "./placed-items.types"
import { Connection } from "mongoose"

@Injectable()
export class PlacedItemsService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async getPlacedItems({ userId }: GetPlacedItemsParams) {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: userId })
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }
}