import { GetInventoriesArgs, GetInventoriesResponse } from "./inventories.dto"
import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, InventorySchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getInventory(id: string): Promise<InventorySchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection.model<InventorySchema>(InventorySchema.name).findById(id)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getInventories(
        { id }: UserLike,
        { limit = 10, offset = 0 }: GetInventoriesArgs
    ): Promise<GetInventoriesResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const data = await this.connection.model<InventorySchema>(InventorySchema.name)
                .find({ user: id })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)

            const count = await this.connection.model<InventorySchema>(InventorySchema.name)
                .countDocuments({
                    user: id
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
