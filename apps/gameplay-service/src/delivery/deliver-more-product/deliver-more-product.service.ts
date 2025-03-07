import { Injectable, Logger } from "@nestjs/common"
import { DeliverMoreProductRequest, DeliverMoreProductResponse } from "./deliver-more-product.dto"
import {
    InjectMongoose,
    INVENTORY_TYPE,
    InventoryKind,
    InventorySchema,
    InventoryTypeSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class DeliverMoreProductService {
    private readonly logger = new Logger(DeliverMoreProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async deliverMoreProduct({
        inventoryId,
        quantity,
        userId,
        index
    }: DeliverMoreProductRequest): Promise<DeliverMoreProductResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const deliveryInventory = await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .findOne({
                    kind: InventoryKind.Delivery,
                    index
                })
                .session(mongoSession)

            if (!deliveryInventory) {
                throw new GrpcNotFoundException("Delivery product not found")
            }

            if (deliveryInventory.user.toString() !== userId) {
                throw new GrpcNotFoundException("Delivery product not belong to user")
            }

            // Fetch inventory
            const inventory = await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .findById(inventoryId)
                .populate(INVENTORY_TYPE)
                .session(mongoSession)
            if (!inventory) {
                throw new GrpcNotFoundException("Inventory not found")
            }
            if (inventory.user.toString() !== userId) {
                throw new GrpcNotFoundException("Delivery product not belong to user")
            }
            if (inventory.quantity < quantity) {
                throw new GrpcNotFoundException("Not enough quantity to deliver")
            }

            const productId = (inventory.inventoryType as InventoryTypeSchema).product as string
            if (!productId) {
                throw new GrpcNotFoundException("The inventory type is not a product")
            }
            // Deliver is simple, just subtract quantity and create a new inventory kind Deliver
            inventory.quantity -= quantity
            await inventory.save({ session: mongoSession })

            // Update the delivery inventory
            deliveryInventory.quantity += quantity
            await deliveryInventory.save({ session: mongoSession })

            await mongoSession.commitTransaction()
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
        return {}
    }
}
