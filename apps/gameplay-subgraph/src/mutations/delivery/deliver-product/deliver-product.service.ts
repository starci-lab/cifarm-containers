import { Injectable, Logger } from "@nestjs/common"
import { DeliverProductRequest } from "./deliver-product.dto"
import { InjectMongoose, InventoryKind, InventorySchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { StaticService } from "@src/gameplay"

@Injectable()
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService
    ) {}

    async deliverProduct(
        { id: userId }: UserLike,
        { inventoryId, quantity, index }: DeliverProductRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to manage the transaction
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY
                 ************************************************************/
                // Fetch the user's inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(mongoSession)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE OWNERSHIP AND QUANTITY
                 ************************************************************/

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

                /************************************************************
                 * VALIDATE PRODUCT TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (type) => type.id.toString() === inventory.inventoryType.toString()
                )
                const productId = inventoryType.product.toString()
                if (!productId) {
                    throw new GraphQLError("The inventory type is not a product", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }

                /************************************************************
                 * UPDATE SOURCE INVENTORY
                 ************************************************************/
                // Subtract the quantity from the user's inventory
                if (inventory.quantity === quantity) {
                    // Delete the inventory if all quantity is used
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteOne({
                            _id: inventoryId
                        })
                        .session(mongoSession)
                } else {
                    // Update the inventory with reduced quantity
                    inventory.quantity -= quantity
                    await inventory.save({ session: mongoSession })
                }

                /************************************************************
                 * CREATE DELIVERY INVENTORY
                 ************************************************************/
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
            })
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
