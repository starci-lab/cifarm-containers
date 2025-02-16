import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    DefaultInfo,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeSchema,
    SystemId,
    SystemRecord,
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
        mongoSession.startTransaction()

        try {
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
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

            const { occupiedIndexes, inventories } = await this.inventoryService.getParams({
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
            await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .create(createdInventories, { session: mongoSession })
            for (const inventory of updatedInventories) {
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .updateOne({ _id: inventory._id }, inventory)
                    .session(mongoSession)
            }
            // Delete the delivery inventory
            await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .deleteOne({ _id: inventory._id }, { session: mongoSession })
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
