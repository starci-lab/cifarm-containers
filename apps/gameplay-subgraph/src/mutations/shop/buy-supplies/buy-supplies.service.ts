import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    UserSchema
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
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE SUPPLY
                 ************************************************************/
                const supply = this.staticService.supplies.find(
                    (supply) => supply.displayId === supplyId
                )
                if (!supply) {
                    throw new GraphQLError("Supply not found in static service", {
                        extensions: {
                            code: "SUPPLY_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }

                if (!supply.availableInShop) {
                    throw new GraphQLError("Supply not available in shop", {
                        extensions: {
                            code: "SUPPLY_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                const totalCost = supply.price * quantity

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                const { storageCapacity } = this.staticService.defaultInfo

                // Get inventory type
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Supply &&
                        inventoryType.supply.toString() === supply.id.toString()
                )
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Subtract gold
                this.goldBalanceService.subtract({
                    user,
                    amount: totalCost
                })

                // Save updated user data
                await user.save({ session: mongoSession })

                /************************************************************
                 * ADD SUPPLIES TO INVENTORY
                 ************************************************************/
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

                // Create new inventory items
                if (createdInventories.length > 0) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session: mongoSession })
                }

                // Update existing inventory items
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(mongoSession)
                }
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
