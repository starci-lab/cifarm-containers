import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema
} from "@src/databases"
import { MoveInventoryRequest } from "./move-inventory.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class MoveInventoryService {
    private readonly logger = new Logger(MoveInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
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

                /************************************************************
                 * CHECK IF DESTINATION SLOT IS OCCUPIED
                 ************************************************************/
                // Check if there's an inventory at the target index
                const foundInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        index,
                        kind
                    })
                    .session(mongoSession)

                /************************************************************
                 * UPDATE INVENTORY POSITIONS
                 ************************************************************/
                if (foundInventory) {
                    //const inventoryType = inventory.inventoryType as InventoryTypeSchema
                    const inventoryType = this.staticService.inventoryTypes.find(
                        (inventoryType) => inventoryType.id.toString() === inventory.inventoryType.toString()
                    )
                    // If the found inventory has the same id, just return
                    if (foundInventory.id === inventoryId) {
                        return {}
                    }

                    // If it has the same type, just update the quantity
                    if (foundInventory.inventoryType.toString() === inventoryType.id) {
                        if (foundInventory.quantity + inventory.quantity <= inventoryType.maxStack) {
                            // Delete the old inventory
                            await this.connection
                                .model<InventorySchema>(InventorySchema.name)
                                .deleteOne({ _id: inventory.id })
                                .session(mongoSession)
                            // Update the quantity of the found inventory
                            foundInventory.quantity += inventory.quantity
                            await foundInventory.save({ session: mongoSession })
                        } else {
                            // Reduce the quantity of the inventory
                            inventory.quantity -= inventoryType.maxStack - foundInventory.quantity
                            foundInventory.quantity = inventoryType.maxStack

                            await inventory.save({ session: mongoSession })
                            await foundInventory.save({ session: mongoSession })
                        }
                    } else {
                        // Swap the inventory
                        const { index: foundIndex, kind: foundKind } = foundInventory
                        foundInventory.index = inventory.index
                        foundInventory.kind = inventory.kind
                        inventory.index = foundIndex
                        inventory.kind = foundKind

                        await inventory.save({ session: mongoSession })
                        await foundInventory.save({ session: mongoSession })
                    }
                } else {
                    // If not, just update the index and kind
                    inventory.index = index
                    inventory.kind = kind
                    await inventory.save({ session: mongoSession })
                }
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, requireQuery: true }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
