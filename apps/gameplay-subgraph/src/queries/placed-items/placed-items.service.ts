import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { PlacedItemsRequest } from "./placed-items.dto"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
    ) {}

    async getPlacedItem(id: string): Promise<PlacedItemSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(id)
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getPlacedItems(
        { id }: UserLike,
        { userId }: PlacedItemsRequest
    ): Promise<Array<PlacedItemSchema>> {
        // return the user id if not provided
        userId = userId || id
        const mongoSession = await this.connection.startSession()
        try {
            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: userId })
                .session(mongoSession)
            return placedItems
        } finally {
            await mongoSession.endSession()
        }
    }
}
