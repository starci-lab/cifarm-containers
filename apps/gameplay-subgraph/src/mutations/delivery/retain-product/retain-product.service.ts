import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
} from "@src/databases"
import { InventoryService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { RetainProductRequest } from "./retain-product.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class RetainProductService {
    private readonly logger = new Logger(RetainProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService
    ) {}

    async retainProduct(
        { id: userId }: UserLike, 
        { inventoryId }: RetainProductRequest): Promise<void> {
        const session = await this.connection.startSession()

        try {
            // Using withTransaction to manage the transaction
            await session.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE DELIVERY INVENTORY
                 ************************************************************/
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(session)

                if (!inventory) {
                    throw new GraphQLError("Delivering product not found", {
                        extensions: {
                            code: "DELIVERING_PRODUCT_NOT_FOUND"
                        }
                    })
                }

                if (inventory.kind !== InventoryKind.Delivery) {
                    throw new GraphQLError("The inventory kind is not delivering", {
                        extensions: {
                            code: "INVENTORY_KIND_IS_NOT_DELIVERING"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (type) => type.id === inventory.inventoryType.toString()
                )

                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found in static service", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE STORAGE CAPACITY
                 ************************************************************/
                const { storageCapacity } = this.staticService.defaultInfo
                /************************************************************
                 * PREPARE INVENTORY PARAMETERS
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session,
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

                /************************************************************
                 * CREATE NEW STORAGE INVENTORIES
                 ************************************************************/
                // Create new inventory records for Storage
                if (createdInventories.length > 0) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                }

                /************************************************************
                 * UPDATE EXISTING INVENTORIES
                 ************************************************************/
                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                }

                /************************************************************
                 * DELETE DELIVERY INVENTORY
                 ************************************************************/
                // Delete the original delivery inventory
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteOne({ _id: inventory._id }, { session })
            })
        } catch (error) {
            this.logger.error(error)
            throw error // withTransaction will automatically handle the rollback
        } finally {
            await session.endSession() // Ensure the session is closed
        }
    }
}
