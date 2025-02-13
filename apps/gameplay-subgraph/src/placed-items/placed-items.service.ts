import { GetPlacedItemsArgs, GetPlacedItemsResponse } from "./placed-items.dto"
import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getPlacedItem(id: string): Promise<PlacedItemSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(id).session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getPlacedItems(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetPlacedItemsArgs
    ): Promise<GetPlacedItemsResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const data = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: id }).session(mongoSession)
                .skip(offset)
                .limit(limit)

            const count = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: id
                }).session(mongoSession)

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
