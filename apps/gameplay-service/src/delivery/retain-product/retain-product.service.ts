import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    DefaultInfo,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeSchema,
    SystemId,
    KeyValueRecord,
    SystemSchema
} from "@src/databases"
import { InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { RetainProductRequest, RetainProductResponse } from "./retain-product.dto"

@Injectable()
export class RetainProductService {
    private readonly logger = new Logger(RetainProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService
    ) {}

    async retainProduct({ inventoryId, userId }: RetainProductRequest): Promise<RetainProductResponse> {
        const mongoSession = await this.connection.startSession()

        try {
            // Using withTransaction to manage the transaction
            const result = await mongoSession.withTransaction(async () => {
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(mongoSession)

                if (!inventory) {
                    throw new GrpcNotFoundException("Delivering product not found")
                }

                if (inventory.kind !== InventoryKind.Delivery) {
                    throw new GrpcNotFoundException("The inventory kind is not delivering")
                }

                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        _id: inventory.inventoryType
                    })
                    .session(mongoSession)

                if (!inventoryType) {
                    throw new GrpcNotFoundException("Inventory seed type not found")
                }

                const {
                    value: { storageCapacity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session: mongoSession,
                    kind: InventoryKind.Storage
                })

                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    occupiedIndexes,
                    quantity: inventory.quantity,
                    capacity: storageCapacity,
                    userId,
                    kind: InventoryKind.Storage
                })

                // Create new inventory records for Storage
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session: mongoSession })

                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(mongoSession)
                }

                // Delete the original delivery inventory
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteOne({ _id: inventory._id }, { session: mongoSession })

                return {}
            })

            return result // Return an empty object as the response
        } catch (error) {
            this.logger.error(error)
            throw error // withTransaction will automatically handle the rollback
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
