import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import {
    ShipWholesaleMarketInventoriesRequest,
    ShipWholesaleMarketInventoriesResponse
} from "./ship-wholesale-market-inventories.dto"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class ShipWholesaleMarketInventoriesService {
    private readonly logger = new Logger(ShipWholesaleMarketInventoriesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
    ) {}

    async shipWholesaleMarketInventories(
        { id: userId }: UserLike,
        { inventoryIds, productId }: ShipWholesaleMarketInventoriesRequest
    ): Promise<ShipWholesaleMarketInventoriesResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async (session) => {
                const { wholesaleMarket } = this.staticService
                const inventories = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .find({ _id: { $in: inventoryIds } })
                    .session(session)
                if (inventories.length !== inventoryIds.length) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND",
                        }
                    })
                }
                if (inventories.some((inventory) => inventory.kind !== InventoryKind.Storage)) {
                    throw new GraphQLError("Inventory is not a storage", {
                        extensions: {
                            code: "INVENTORY_NOT_A_STORAGE",
                        }
                    })
                }
                //we thus check if product is in the wholesale market
                const product = wholesaleMarket.products.find((product) => product.productId.toString() === productId)
                if (!product) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND",
                        }
                    })
                }
                //we thus process shipping for each inventory
                for (const inventory of inventories) {
                    //we check if inventory has enough quantity
                    if (inventory.quantity < product.quantity) {
                        throw new GraphQLError("Inventory has not enough quantity", {
                            extensions: {
                                code: "INVENTORY_NOT_ENOUGH_QUANTITY",
                            }
                        })
                    }
                }
            })
            return {
                success: true,
                message: "Wholesale market shipped successfully"
            }
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow the error after logging
        } finally {
            await mongoSession.endSession() // Ensure the session is always ended
        }
    }
}
