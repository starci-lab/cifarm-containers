import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    INVENTORY_TYPE,
    InventoryKind,
    InventorySchema,
    InventoryTypeSchema,
    SystemId,
    KeyValueRecord,
    SystemSchema
} from "@src/databases"
import { createObjectId, EmptyObjectType } from "@src/common"
import { Connection } from "mongoose"
import { MoveInventoryRequest } from "./move-inventory.dto"
import { UserLike } from "@src/jwt"

@Injectable()
export class MoveInventoryService {
    private readonly logger = new Logger(MoveInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async moveInventory(
        {
            id: userId
        }: UserLike,
        {
            isTool,
            index,
            inventoryId
        }: MoveInventoryRequest): Promise<EmptyObjectType> {
        const mongoSession = await this.connection.startSession()

        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async () => {
                const {
                    value: { storageCapacity, toolCapacity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(mongoSession)

                const capacity = isTool ? toolCapacity : storageCapacity
                if (index >= capacity) {
                    throw new BadRequestException("Inventory index is out of range")
                }
                const kind = isTool ? InventoryKind.Tool : InventoryKind.Storage

                // Get inventory by ID
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .populate(INVENTORY_TYPE)
                    .session(mongoSession)
                if (!inventory) {
                    throw new NotFoundException("Inventory not found")
                }

                // Check if there is an inventory at the target index
                const foundInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        index,
                        kind
                    })
                    .session(mongoSession)
                if (foundInventory) {
                    const inventoryType = inventory.inventoryType as InventoryTypeSchema
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

            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
