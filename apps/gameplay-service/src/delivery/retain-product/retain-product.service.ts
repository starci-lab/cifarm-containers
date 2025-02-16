import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { DefaultInfo, DeliveringProductSchema, InjectMongoose, InventorySchema, InventoryType, InventoryTypeSchema, SystemId, SystemRecord, SystemSchema } from "@src/databases"
import { InventoryService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { RetainProductResponse } from "./retain-product.dto"

@Injectable()
export class RetainProductService {
    private readonly logger = new Logger(RetainProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService
    ) {}

    async retainProduct(request): Promise<RetainProductResponse> {
        this.logger.debug(`Retaining product for user ${request.userId}, deliveringProduct ID: ${request.deliveringProductId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const deliveringProduct = await this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name)
                .findById(request.deliveringProductId)
                .session(mongoSession)

            if (!deliveringProduct) {
                throw new GrpcNotFoundException("Delivering product not found")
            }

            
            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findOne({
                type: InventoryType.Seed,
                product: deliveringProduct.deliveringProductTypeKey
            }).session(mongoSession)

            if (!inventoryType) {
                throw new GrpcNotFoundException("Inventory seed type not found")
            }  
            
            const { value: { inventoryCapacity } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

            const { occupiedIndexes, inventories } = await this.inventoryService.getParams({
                connection: this.connection,
                inventoryType,
                userId: request.userId,
                session: mongoSession
            })

            try {
                await this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name).deleteOne({ _id: deliveringProduct._id })
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: inventoryCapacity,
                    quantity: deliveringProduct.quantity,
                    userId: request.userId,
                    occupiedIndexes,
                    inToolbar: false
                })

                await this.connection.model<InventorySchema>(InventorySchema.name).create(createdInventories)
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).updateOne({ _id: inventory._id }, inventory)
                }

                await mongoSession.commitTransaction()
                return {}
            } catch (error) {
                this.logger.error(`Transaction failed, reason: ${error.message}`)
                await mongoSession.abortTransaction()
                throw new GrpcInternalException(error.message)
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
