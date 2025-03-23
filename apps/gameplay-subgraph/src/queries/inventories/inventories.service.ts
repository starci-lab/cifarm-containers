import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, InventorySchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"

@Injectable()
export class InventoriesService {
    private readonly logger = new Logger(InventoriesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cache: Cache
    ) {}

    async getInventory(id: string): Promise<InventorySchema> {
        return await this.connection.model(InventorySchema.name).findById(id)
    }

    async getInventories({ id }: UserLike): Promise<Array<InventorySchema>> {
        return await this.connection.model(InventorySchema.name).find({
            user: id
        })
    }
}
