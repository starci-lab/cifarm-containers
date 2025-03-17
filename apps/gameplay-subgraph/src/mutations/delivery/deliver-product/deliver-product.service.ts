import { Injectable, Logger } from "@nestjs/common"
import { DeliverProductRequest } from "./deliver-product.dto"
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
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async deliverProduct(
        { id: userId }: UserLike,
        {
            inventoryId,
            quantity,
            index
        }: DeliverProductRequest): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to manage the transaction
            await mongoSession.withTransaction(async () => {
                // Fetch the user's inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .populate(INVENTORY_TYPE)
                    .session(mongoSession)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                if (inventory.user.toString() !== userId) {
                    throw new GraphQLError("Delivery product does not belong to user", {
                        extensions: {
                            code: "UNAUTHORIZED_DELIVERY"
                        }
                    })
                }

                if (inventory.quantity < quantity) {
                    throw new GraphQLError("Not enough quantity to deliver", {
                        extensions: {
                            code: "INSUFFICIENT_QUANTITY"
                        }
                    })
                }

                const productId = (inventory.inventoryType as InventoryTypeSchema).product as string
                if (!productId) {
                    throw new GraphQLError("The inventory type is not a product", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
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
