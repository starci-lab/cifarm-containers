import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { DeliverMoreProductRequest } from "./deliver-more-product.dto"
import {
    InjectMongoose,
    INVENTORY_TYPE,
    InventoryKind,
    InventorySchema,
    InventoryTypeSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"

@Injectable()
export class DeliverMoreProductService {
    private readonly logger = new Logger(DeliverMoreProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async deliverMoreProduct(
        { id: userId }: UserLike,
        {
            inventoryId,
            quantity,
            index
        }: DeliverMoreProductRequest): Promise<EmptyObjectType> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to manage the transaction
            const result = await mongoSession.withTransaction(async () => {
                // Fetch the delivery inventory
                const deliveryInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        kind: InventoryKind.Delivery,
                        index
                    })
                    .session(mongoSession)

                if (!deliveryInventory) {
                    throw new NotFoundException("Delivery product not found")
                }

                if (deliveryInventory.user.toString() !== userId) {
                    throw new NotFoundException("Delivery product does not belong to user")
                }

                // Fetch the user's inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .populate(INVENTORY_TYPE)
                    .session(mongoSession)

                if (!inventory) {
                    throw new NotFoundException("Inventory not found")
                }

                if (inventory.user.toString() !== userId) {
                    throw new NotFoundException("Inventory does not belong to user")
                }

                if (inventory.quantity < quantity) {
                    throw new NotFoundException("Not enough quantity to deliver")
                }

                const productId = (inventory.inventoryType as InventoryTypeSchema).product as string
                if (!productId) {
                    throw new NotFoundException("The inventory type is not a product")
                }

                // Subtract the quantity from the user's inventory
                if (inventory.quantity === quantity) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteOne({
                            _id: inventoryId
                        })
                        .session(mongoSession)
                } else {
                    inventory.quantity -= quantity
                    await inventory.save({ session: mongoSession })
                }


                await inventory.save({ session: mongoSession })

                // Add the quantity to the delivery inventory
                deliveryInventory.quantity += quantity
                await deliveryInventory.save({ session: mongoSession })

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
