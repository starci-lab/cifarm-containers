import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, StaticService, SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyToolRequest } from "./buy-tool.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { KafkaTopic } from "@src/brokers"
import { InjectKafkaProducer } from "@src/brokers"
import { Producer } from "kafkajs"
import { SchemaStatus, WithStatus } from "@src/common"

@Injectable()   
export class BuyToolService {
    private readonly logger = new Logger(BuyToolService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async buyTool(
        { id: userId }: UserLike,
        { toolId }: BuyToolRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        
        let user: UserSchema | undefined
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE TOOL
                 ************************************************************/
                const tool = this.staticService.tools.find(
                    (tool) => tool.displayId === toolId
                )
                if (!tool) {
                    throw new GraphQLError("Tool not found", {
                        extensions: {
                            code: "TOOL_NOT_FOUND"
                        }
                    })
                }
                
                if (!tool.availableInShop) {
                    throw new GraphQLError("Tool not available in shop", {
                        extensions: {
                            code: "TOOL_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tool.price
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.type === InventoryType.Tool && inventoryType.tool.toString() === tool.id.toString()
                )

                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }

                // Check if user has the tool already
                const userHasTool = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .exists({
                        user: userId,
                        inventoryType: inventoryType.id
                    })
                    .session(session)

                if (userHasTool) {
                    throw new GraphQLError("User already has the tool", {
                        extensions: {
                            code: "USER_ALREADY_HAS_THE_TOOL"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: tool.price
                })

                // Save updated user data
                await user.save({ session })

                /************************************************************
                 * ADD TOOL TO INVENTORY
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                const { storageCapacity } = this.staticService.defaultInfo

                //Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    userId: user.id,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                // Create new inventory items
                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                    const createdSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: createdInventoryRaws,
                        status: SchemaStatus.Created
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventory items
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    // get synced inventory then add to syncedInventories
                    const updatedSyncedInventory = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: [inventory],
                        status: SchemaStatus.Updated
                    })
                    syncedInventories.push(...updatedSyncedInventory)
                }
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: user.toJSON() }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories })}]
                })
            ])
        } catch (error) {
            this.logger.error(error)
            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
