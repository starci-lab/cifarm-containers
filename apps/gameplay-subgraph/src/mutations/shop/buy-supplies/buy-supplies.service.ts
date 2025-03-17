import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    InjectMongoose, InventoryKind, InventorySchema,
    InventoryTypeSchema,
    SupplySchema, UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService
    ) {}

    async buySupplies(
        { id: userId }: UserLike,
        { quantity, supplyId }: BuySuppliesRequest
    ): Promise<void> { 
        const mongoSession = await this.connection.startSession()
        try {
            await mongoSession.withTransaction(async () => {
                const supply = await this.connection.model<SupplySchema>(SupplySchema.name)
                    .findById(createObjectId(supplyId))
                    .session(mongoSession)

                if (!supply) throw new GraphQLError("Supply not found", {
                    extensions: {
                        code: "SUPPLY_NOT_FOUND",
                    }
                })
                if (!supply.availableInShop)
                    throw new GraphQLError("Supply not available in shop", {
                        extensions: {
                            code: "SUPPLY_NOT_AVAILABLE_IN_SHOP",
                        }
                    })
                const totalCost = supply.price * quantity

                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged },
                    { session: mongoSession }
                )

                const { storageCapacity } = this.staticService.defaultInfo

                // Get inventory type
                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(createObjectId(supplyId))
                    .session(mongoSession)

                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND",
                        }
                    })
                }

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession
                })
                
                // Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    quantity,
                    userId: user.id,
                    capacity: storageCapacity,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories, { session: mongoSession })
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                        { _id: inventory._id },
                        inventory
                    ).session(mongoSession)
                }

                // No return value needed for void
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
