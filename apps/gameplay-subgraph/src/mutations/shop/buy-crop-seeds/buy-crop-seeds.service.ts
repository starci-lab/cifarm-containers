import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    PlantType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyCropSeedsRequest } from "./buy-crop-seeds.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { KafkaTopic } from "@src/brokers"
import { InjectKafkaProducer } from "@src/brokers"
import { Producer } from "kafkajs"
import { WithStatus, SchemaStatus } from "@src/common"

@Injectable()
export class BuyCropSeedsService {
    private readonly logger = new Logger(BuyCropSeedsService.name)

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

    async buyCropSeeds({ id: userId }: UserLike, request: BuyCropSeedsRequest): Promise<void> {
        // Start session
        const mongoSession = await this.connection.startSession()

        let user: UserSchema | undefined
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            await mongoSession.withTransaction(async (session) => {
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
                    .session(session)

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
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Seed &&
                        inventoryType.seedType === PlantType.Crop &&
                        inventoryType.crop.toString() === crop.id.toString()
                )

                if (!inventoryType) {
                    throw new GraphQLError("Inventory crop seed type not found", {
                        extensions: {
                            code: "INVENTORY_CROP_SEED_TYPE_NOT_FOUND"
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
                await user.save({ session })

                /************************************************************
                 * ADD SEEDS TO INVENTORY
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
                    quantity: request.quantity,
                    userId: user.id,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                // Create new inventory items
                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                    const createdSyncedInventories =
                        this.syncService.getCreatedOrUpdatedSyncedInventories({
                            inventories: createdInventoryRaws,
                            status: SchemaStatus.Created
                        })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventory items
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    // get synced inventory then add to syncedInventories
                    const updatedSyncedInventory =
                        this.syncService.getCreatedOrUpdatedSyncedInventories({
                            inventories: [inventory],
                            status: SchemaStatus.Updated
                        })
                    syncedInventories.push(...updatedSyncedInventory)
                }
            })

            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId,
                                user: this.syncService.getSyncedUser(user)
                            })
                        }
                    ]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [
                        { value: JSON.stringify({ userId, inventories: syncedInventories }) }
                    ]
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
