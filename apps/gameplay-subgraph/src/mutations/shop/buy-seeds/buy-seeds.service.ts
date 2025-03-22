import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { KafkaTopic } from "@src/brokers"
import { InjectKafkaProducer } from "@src/brokers"
import { Producer } from "kafkajs"
import { WithStatus, SchemaStatus } from "@src/common"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async buySeeds({ id: userId }: UserLike, request: BuySeedsRequest): Promise<void> {
        // Start session
        const mongoSession = await this.connection.startSession()
        
        let user: UserSchema | undefined
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE CROP
                 ************************************************************/
                const crop = this.staticService.crops.find(
                    (crop) => crop.displayId.toString() === request.cropId
                )

                if (!crop) {
                    throw new GraphQLError("Crop not found", {
                        extensions: {
                            code: "CROP_NOT_FOUND"
                        }
                    })
                }

                if (!crop.availableInShop) {
                    throw new GraphQLError("Crop not available in shop", {
                        extensions: {
                            code: "CROP_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                const totalCost = crop.price * request.quantity

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                //Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                //Get inventory type
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Seed,
                        crop: createObjectId(request.cropId)
                    })
                    .session(mongoSession)

                if (!inventoryType) {
                    throw new GraphQLError("Inventory seed type not found", {
                        extensions: {
                            code: "INVENTORY_SEED_TYPE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Subtract gold
                this.goldBalanceService.subtract({
                    user,
                    amount: totalCost
                })

                // Save updated user data
                await user.save({ session: mongoSession })

                /************************************************************
                 * ADD SEEDS TO INVENTORY
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session: mongoSession
                })

                const { storageCapacity } = this.staticService.defaultInfo

                //Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity: request.quantity,
                    userId: user.id,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                // Create new inventory items
                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session: mongoSession })
                    const createdSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: createdInventoryRaws,
                        status: SchemaStatus.Created
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventory items
                for (const inventory of updatedInventories) {
                    await inventory.save({ session: mongoSession })
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
                    messages: [{ value: JSON.stringify({ userId, user: this.syncService.getSyncedUser(user) }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
