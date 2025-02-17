import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    INVENTORY_TYPE,
    InventoryKind,
    InventorySchema,
    InventoryTypeSchema,
    SystemId,
    SystemRecord,
    SystemSchema,
} from "@src/databases"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import {
    MoveInventoryRequest,
    MoveInventoryResponse
} from "./move-inventory.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class MoveInventoryService {
    private readonly logger = new Logger(MoveInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService
    ) {}

    async moveInventory(
        { isTool, index, inventoryId, userId }: MoveInventoryRequest
    ): Promise<MoveInventoryResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const {
                value: { storageCapacity, toolCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)

            const capacity = isTool ? toolCapacity : storageCapacity
            if (index >= capacity) {
                throw new GrpcFailedPreconditionException("Inventory index is out of range")
            }
            const kind = isTool ? InventoryKind.Tool : InventoryKind.Storage
            // get inventory 
            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name).findById(inventoryId).session(mongoSession)
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
                }).populate(INVENTORY_TYPE)
                .session(mongoSession)

            if (foundInventory) {
            // if it have the same type, just update the quantity by call inventory service
                if (foundInventory.inventoryType === inventory.inventoryType) {
                //
                    const { inventories, occupiedIndexes } = await this.inventoryService.getAddParams({
                        userId,
                        inventoryType: inventory.inventoryType as InventoryTypeSchema,
                        connection: this.connection,
                        session: mongoSession,
                        kind
                    })
                    const { updatedInventories, createdInventories } = this.inventoryService.add({
                        inventories,
                        occupiedIndexes,
                        capacity: storageCapacity,
                        inventoryType: inventory.inventoryType as InventoryTypeSchema,
                        quantity: inventory.quantity,
                        userId,
                        kind
                    })
                
                    // add the new inventories
                    await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories, { session: mongoSession })
                    // update the inventories
                    for (const updatedInventory of updatedInventories) {
                        await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                            { _id: updatedInventory.id },
                            {
                                quantity: updatedInventory.quantity
                            }
                        ).session(mongoSession)
                    }
                    // delete the old inventory
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteOne({ _id: inventoryId }).session(mongoSession)
                } else {
                    // swap the inventory
                    const { index: foundIndex, kind: foundKind } = foundInventory
                    foundInventory.index = inventory.index
                    foundInventory.kind = inventory.kind
                    inventory.index = foundIndex
                    inventory.kind = foundKind
                    await foundInventory.save()
                    await inventory.save()
                }
            } else {
                // if not, just update the index and kind
                await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                    { _id: inventoryId },
                    {
                        index,
                        kind
                    }
                ).session(mongoSession)
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