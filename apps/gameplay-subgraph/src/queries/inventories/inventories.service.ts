import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common"
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

    async getInventory(id: string, { id: userId }: UserLike): Promise<InventorySchema> {
        try {
            const inventory = await this.connection.model(InventorySchema.name).findById(id)
            if (!inventory) {
                throw new NotFoundException("Inventory not found")
            }
            if (inventory.user.toString() !== userId) {
                throw new ForbiddenException("You are not allowed to access this inventory")
            }
            return inventory
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    async getInventories({ id }: UserLike): Promise<Array<InventorySchema>> {
        try {
            return await this.connection.model(InventorySchema.name).find({
                user: id
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}
