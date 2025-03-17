import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    INVENTORY_TYPE,
    InventoryKind,
    InventorySchema
} from "@src/databases"
import { MoveInventoryRequest } from "./move-inventory.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
@Injectable()
export class MoveInventoryService {
    private readonly logger = new Logger(MoveInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService
    ) {}

    async moveInventory(
        {
            id: userId
        }: UserLike,
        {
            isTool,
            index,
            inventoryId
        }: MoveInventoryRequest): Promise<void> {
        const mongoSession = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                const { storageCapacity, toolCapacity } = this.staticService.defaultInfo

                /************************************************************
                 * VALIDATE INDEX AND DETERMINE INVENTORY KIND
                 ************************************************************/
                const capacity = isTool ? toolCapacity : storageCapacity
                if (index >= capacity) {
                    throw new GraphQLError("Inventory index is out of range", {
                        extensions: {
                            code: "INVALID_INVENTORY_INDEX"
                        }
                    })
                }
                const kind = isTool ? InventoryKind.Tool : InventoryKind.Storage

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY
                 ************************************************************/
                // Get inventory by ID
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .populate(INVENTORY_TYPE)
                    .session(mongoSession)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                // Check if the inventory belongs to the user
                if (inventory.user.toString() !== userId) {
                    throw new GraphQLError("Inventory does not belong to user", {
                        extensions: {
                            code: "UNAUTHORIZED_INVENTORY_ACCESS"
                        }
                    })
                }

                // Check if the inventory type matches the requested kind
                if (inventory.kind !== kind) {
                    throw new GraphQLError(`Invalid inventory kind. Expected ${kind} but got ${inventory.kind}`, {
                        extensions: {
                            code: "INVALID_INVENTORY_KIND"
                        }
                    })
                }

                /************************************************************
                 * CHECK IF DESTINATION SLOT IS OCCUPIED
                 ************************************************************/
                // Check if there's an inventory at the target index
                const foundInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        index,
                        kind,
                        user: userId,
                        _id: { $ne: inventoryId } // Not the same inventory
                    })
                    .session(mongoSession)

                /************************************************************
                 * UPDATE INVENTORY POSITIONS
                 ************************************************************/
                if (foundInventory) {
                    // Swap positions
                    foundInventory.index = inventory.index
                    await foundInventory.save({ session: mongoSession })
                }

                // Update inventory position
                inventory.index = index
                await inventory.save({ session: mongoSession })
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
