import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    INVENTORY_TYPE,
    InventorySchema,
    InventoryTypeSchema,
    SystemId,
    SystemRecord,
    SystemSchema,
} from "@src/databases"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { InventoryService, TutorialService } from "@src/gameplay"
import { Connection } from "mongoose"
import {
    UpdateInventoryIndexRequest,
    UpdateInventoryIndexResponse
} from "./update-inventory-index.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class UpdateInventoryIndexService {
    private readonly logger = new Logger(UpdateInventoryIndexService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tutorialService: TutorialService,
        private readonly inventoryService: InventoryService
    ) {}

    async updateInventoryIndex(
        { inToolbar, index, inventoryId, userId }: UpdateInventoryIndexRequest
    ): Promise<UpdateInventoryIndexResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const {
                value: { inventoryCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)

            if (
                (index >= inventoryCapacity && !inToolbar) ||
                (index >= 8 && inToolbar)
            ) {
                throw new GrpcFailedPreconditionException("Inventory index is out of range")
            }

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
                    inToolbar
                }).populate(INVENTORY_TYPE)
                .session(mongoSession)
            if (foundInventory) {
            // if it have the same type, just update the quantity by call inventory service
                const { inventories, occupiedIndexes } = await this.inventoryService.getParams({
                    userId,
                    inventoryType: inventory.inventoryType as InventoryTypeSchema,
                    connection: this.connection,
                    session: mongoSession
                })
                const { updatedInventories, createdInventories } = this.inventoryService.add({
                    inventories,
                    occupiedIndexes,
                    capacity: inventoryCapacity,
                    inventoryType: inventory.inventoryType as InventoryTypeSchema,
                    quantity: inventory.quantity,
                    userId,
                    inToolbar
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
                // if not, just update the index
                await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                    { _id: inventoryId },
                    {
                        index,
                        inToolbar
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