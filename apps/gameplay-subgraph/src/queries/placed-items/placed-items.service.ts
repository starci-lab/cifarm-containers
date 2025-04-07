import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFT_METADATA, PlacedItemSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import {
    PlacedItemsRequest,
    StoredPlacedItemsRequest,
    StoredPlacedItemsResponse
} from "./placed-items.dto"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getPlacedItem(id: string): Promise<PlacedItemSchema> {
        return await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(id)
    }

    async getPlacedItems(
        { id }: UserLike,
        { userId }: PlacedItemsRequest
    ): Promise<Array<PlacedItemSchema>> {
        // return the user id if not provided
        userId = userId || id
        return await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: userId,
            isStored: {
                $ne: true
            }
        })
    }

    async getStoredPlacedItems(
        { id }: UserLike,
        { userId, limit, offset }: StoredPlacedItemsRequest
    ): Promise<StoredPlacedItemsResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            userId = userId || id
            const data = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: userId, isStored: true })
                .skip(offset) // Pagination: skip the specified number of records
                .limit(limit) // Pagination: limit the number of records
                .populate(NFT_METADATA)
            const count = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: userId,
                    isStored: true
                })

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
