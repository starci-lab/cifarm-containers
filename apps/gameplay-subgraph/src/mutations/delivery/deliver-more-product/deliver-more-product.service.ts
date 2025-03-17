import { Injectable, Logger } from "@nestjs/common"
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
import { GraphQLError } from "graphql"

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
        }: DeliverMoreProductRequest): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to manage the transaction
            await mongoSession.withTransaction(async () => {
                // Fetch the delivery inventory
                const deliveryInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        kind: InventoryKind.Delivery,
                        index
                    })
                    .session(mongoSession)

                if (!deliveryInventory) {
                    throw new GraphQLError("Delivery product not found", {
                        extensions: {
                            code: "DELIVERY_PRODUCT_NOT_FOUND",
                        }
                    })
                }

                if (deliveryInventory.user.toString() !== userId) {
                    throw new GraphQLError("Delivery product does not belong to user", {
                        extensions: {
                            code: "DELIVERY_PRODUCT_DOES_NOT_BELONG_TO_USER",
                        }
                    })
                }

                // Fetch the user's inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .populate(INVENTORY_TYPE)
                    .session(mongoSession)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND",
                        }
                    })
                }

                if (inventory.quantity < quantity) {
                    throw new GraphQLError("Not enough quantity to deliver", {
                        extensions: {
                            code: "NOT_ENOUGH_QUANTITY_TO_DELIVER",
                        }
                    })
                }

                const productId = (inventory.inventoryType as InventoryTypeSchema).product as string
                if (!productId) {
                    throw new GraphQLError("The inventory type is not a product", {
                        extensions: {
                            code: "INVENTORY_TYPE_IS_NOT_A_PRODUCT",
                        }
                    })
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

                // No return value needed for void
            })
            
            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
