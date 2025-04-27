import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import {
    ShipWholesaleMarketRequest,
    ShipWholesaleMarketResponse
} from "./ship-wholesale-market.dto"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class ShipWholesaleMarketService {
    private readonly logger = new Logger(ShipWholesaleMarketService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
    ) {}

    async shipWholesaleMarket(
        { id: userId }: UserLike,
        { inventoryIds }: ShipWholesaleMarketRequest
    ): Promise<ShipWholesaleMarketResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async (session) => {
                const { wholesaleMarket } = this.staticService
                const inventories = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .find({ _id: { $in: inventoryIds } })
                    .session(session)
                for (const inventory of inventories) {
                    if (inventory.kind !== InventoryKind.WholesaleMarket) {
                        throw new GraphQLError("Invalid inventory kind")
                    }
                    const inventoryType = this.staticService.inventoryTypes.find(
                        (inventoryType) => inventoryType.id === inventory.inventoryType
                    )
                    if (inventoryType.type !== InventoryType.Product) {
                        throw new GraphQLError("Invalid inventory type")
                    }
                }
                // check if inventory quantity is enough
                for (const product of wholesaleMarket.products) {
                    const productNotFoundOrNotEnough = inventories.some(
                        (inventory) => {
                            const inventoryType = this.staticService.inventoryTypes.find(
                                (inventoryType) => inventoryType.id === inventory.inventoryType
                            )
                            if (inventoryType.product.toString() !== product.productId.toString()) {
                                return false
                            }
                            return inventory.quantity >= product.quantity
                        }
                    )
                    if (!productNotFoundOrNotEnough) {
                        throw new GraphQLError("Product not found or quantity is not enough")
                    }
                }

                // delete all inventories
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({ _id: { $in: inventoryIds } })
                    .session(session)
            
                // get user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
                if (!user) {
                    throw new GraphQLError("User not found")
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
