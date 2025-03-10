import { Injectable, Logger } from "@nestjs/common"
import { DeliverProductRequest, DeliverProductResponse } from "./deliver-product.dto"
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
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async deliverProduct({
        inventoryId,
        quantity,
        userId,
        index
    }: DeliverProductRequest): Promise<DeliverProductResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to manage the transaction
            const result = await mongoSession.withTransaction(async () => {
                // Fetch the user's inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .populate(INVENTORY_TYPE)
                    .session(mongoSession)

                if (!inventory) {
                    throw new GrpcNotFoundException("Inventory not found")
                }

                if (inventory.user.toString() !== userId) {
                    throw new GrpcNotFoundException("Delivery product does not belong to user")
                }

                if (inventory.quantity < quantity) {
                    throw new GrpcNotFoundException("Not enough quantity to deliver")
                }

                const productId = (inventory.inventoryType as InventoryTypeSchema).product as string
                if (!productId) {
                    throw new GrpcNotFoundException("The inventory type is not a product")
                }

                // Subtract the quantity from the user's inventory
                inventory.quantity -= quantity
                await inventory.save({ session: mongoSession })

                // Create a new inventory kind for Delivery
                await this.connection.model<InventorySchema>(InventorySchema.name).create(
                    [
                        {
                            quantity,
                            index,
                            kind: InventoryKind.Delivery,
                            user: userId,
                            inventoryType: inventory.inventoryType
                        }
                    ],
                    { session: mongoSession }
                )

                return {}
            })
            
            return result // Return an empty object as the response
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
