import { Injectable, Logger } from "@nestjs/common"
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
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Connection } from "mongoose"
import { MoveInventoryRequest, MoveInventoryResponse } from "./move-inventory.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class MoveInventoryService {
    private readonly logger = new Logger(MoveInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async moveInventory({
        isTool,
        index,
        inventoryId,
        userId
    }: MoveInventoryRequest): Promise<MoveInventoryResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const {
                value: { storageCapacity, toolCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)

            const capacity = isTool ? toolCapacity : storageCapacity
            if (index >= capacity) {
                throw new GrpcFailedPreconditionException("Inventory index is out of range")
            }
            const kind = isTool ? InventoryKind.Tool : InventoryKind.Storage
            // get inventory
            const inventory = await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .findById(inventoryId)
                .populate(INVENTORY_TYPE)
                .session(mongoSession)
            if (!inventory) {
                throw new GrpcNotFoundException("Inventory not found")
            }

            // check if there is inventory existed in the index
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
                // if the found inventory has the same id, just return
                if (foundInventory.id === inventoryId) {
                    return {}
                }
                // if it have the same type, just update the quantity
                if (foundInventory.inventoryType.toString() === inventoryType.id) {
                    //
                    if (foundInventory.quantity + inventory.quantity <= inventoryType.maxStack) {
                        // delete the old inventory
                        await this.connection
                            .model<InventorySchema>(InventorySchema.name)
                            .deleteOne({ _id: inventory.id })
                            .session(mongoSession)
                        // Update the quantity of the found inventory
                        foundInventory.quantity += inventory.quantity
                        await foundInventory.save({ session: mongoSession })
                    } else {
                        // reduce the quantity of the inventory
                        inventory.quantity -= inventoryType.maxStack - foundInventory.quantity
                        foundInventory.quantity = inventoryType.maxStack

                        await inventory.save({ session: mongoSession })
                        await foundInventory.save({ session: mongoSession })
                    }
                } else {
                    // swap the inventory
                    const { index: foundIndex, kind: foundKind } = foundInventory
                    foundInventory.index = inventory.index
                    foundInventory.kind = inventory.kind
                    inventory.index = foundIndex
                    inventory.kind = foundKind

                    await inventory.save({ session: mongoSession })
                    await foundInventory.save({ session: mongoSession })
                }
            } else {
                // if not, just update the index and kind
                inventory.index = index
                inventory.kind = kind

                await inventory.save({ session: mongoSession })
            }
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
