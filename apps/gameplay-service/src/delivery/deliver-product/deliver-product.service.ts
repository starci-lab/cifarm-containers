import { Injectable, Logger } from "@nestjs/common"
import { 
    DeliverProductRequest,
    DeliverProductResponse } from "./deliver-product.dto"
import { InjectMongoose, INVENTORY_TYPE, InventoryKind, InventorySchema, PRODUCT } from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async deliverProduct(
        { inventoryId, quantity, userId, index }: DeliverProductRequest
    ): Promise<DeliverProductResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            // Fetch inventory
            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name).findById(inventoryId).populate(INVENTORY_TYPE).populate(PRODUCT).session(mongoSession)
            if (!inventory) {
                throw new GrpcNotFoundException("Inventory not found")
            }
            if (inventory.quantity < quantity) {
                throw new GrpcNotFoundException("Not enough quantity to deliver")
            }
            // Deliver is simple, just subtract quantity and create a new inventory kind Deliver
            inventory.quantity -= quantity
            await inventory.save()

            // Create new inventory kind Deliver
            await this.connection.model<InventorySchema>(InventorySchema.name).create([{
                quantity,
                index,
                kind: InventoryKind.Delivery,
                user: userId,
                inventoryType: inventory.inventoryType,
            }], { session: mongoSession })

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
