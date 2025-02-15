import { Injectable, Logger } from "@nestjs/common"
import { DeliveringProductSchema, InjectMongoose, InventorySchema, InventoryTypeSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { DeliverProductResponse } from "./deliver-product.dto"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async deliverProduct(request): Promise<DeliverProductResponse> {
        this.logger.debug(`Processing delivery for user ${request.userId}, inventory ID: ${request.inventoryId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                .findById(request.inventoryId)
                .session(mongoSession)

            if (!inventory) {
                throw new GrpcNotFoundException("Inventory not found")
            }

            if (inventory.quantity < request.quantity) {
                throw new GrpcFailedPreconditionException("Not enough quantity to deliver")
            }

            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findById(inventory.inventoryType)
                .session(mongoSession)

            if (!inventoryType.deliverable) {
                throw new GrpcFailedPreconditionException("Inventory type is not deliverable")
            }

            const indexExists = await this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name)
                .exists({ userId: request.userId, index: request.index })
                .session(mongoSession)

            if (indexExists) {
                throw new GrpcFailedPreconditionException("Index already in use")
            }

            try {
                inventory.quantity -= request.quantity
                if (inventory.quantity === 0) {
                    await inventory.deleteOne()
                } else {
                    await inventory.save()
                }

                await this.connection.model<DeliveringProductSchema>(DeliveringProductSchema.name).create({
                    userId: request.userId,
                    quantity: request.quantity,
                    index: request.index,
                    productId: inventoryType.product
                })

                await mongoSession.commitTransaction()
                return {}
            } catch (error) {
                this.logger.error(`Transaction failed, reason: ${error.message}`)
                await mongoSession.abortTransaction()
                throw error
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
