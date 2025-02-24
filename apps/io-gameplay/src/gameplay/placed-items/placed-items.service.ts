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

    public async getPlacedItems({ userId }: GetPlacedItemsParams) : Promise<Array<PlacedItemSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            const items = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: userId })
                .session(mongoSession)
                .lean()

            return items.map(item => ({
                ...item,
                id: item._id.toString(),
            }))
        } finally {
            await mongoSession.endSession()
        }
    }
}