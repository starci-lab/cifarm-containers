import { GetInventoriesArgs, GetInventoriesResponse } from "./inventories.dto"
import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, InventorySchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"

@Injectable()
export class InventoriesService {
    private readonly logger = new Logger(InventoriesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async getInventory(id: string): Promise<InventorySchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model(InventorySchema.name)
                .findById(id)
                .session(mongoSession)
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
            const data = await this.connection
                .model(InventorySchema.name)
                .find({
                    user: id
                })
                .limit(limit)
                .skip(offset)
                .session(mongoSession)

            const count = await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .countDocuments({
                    user: id
                })
                .session(mongoSession)

            return {
                data,
                count
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
