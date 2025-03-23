import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    PlantCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    PlacedItemSchema,
    UserSchema,
    InventoryKind,
    InventoryTypeId,
    ProductType
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    ThiefService,
    StaticService,
    SyncService
} from "@src/gameplay"
import { ThiefPlantRequest, ThiefPlantResponse } from "./thief-plant.dto"
import { Connection, Types } from "mongoose"
import { ActionName, EmitActionPayload, ThiefPlantData } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, DeepPartial, WithStatus, SchemaStatus } from "@src/common"

@Injectable()
export class ThiefPlantService {
    private readonly logger = new Logger(ThiefPlantService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async thiefPlant(
        { id: userId }: UserLike,
        { placedItemTileId }: ThiefPlantRequest
    ): Promise<ThiefPlantResponse> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionMessage: EmitActionPayload<ThiefPlantData> | undefined
        let user: UserSchema | undefined
        let neighborUserId: string | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []     
        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []
          
        try {
            // Use `withTransaction` to handle the MongoDB session and transaction automatically
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE CRATE TOOL
                 ************************************************************/

                // Check if user has crate
                const inventoryCrateExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Crate),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                // Validate crate exists in inventory
                if (!inventoryCrateExisted) {
                    throw new GraphQLError("Crate not found in toolbar", {
                        extensions: {
                            code: "CRATE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TILE
                 ************************************************************/
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }

                syncedPlacedItemAction = {
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    id: placedItemTile.id,
                    placedItemType: placedItemTile.placedItemType
                }


                neighborUserId = placedItemTile.user.toString()
                if (neighborUserId === userId) {
                    throw new GraphQLError("Cannot thief from your own tile", {
                        extensions: {
                            code: "CANNOT_THIEF_FROM_YOUR_OWN_TILE"
                        }
                    })
                }
                if (!placedItemTile.plantInfo) {
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_IS_NOT_PLANTED"
                        }
                    })
                }
                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.FullyMatured) {
                    throw new GraphQLError("Crop is not fully matured", {
                        extensions: {
                            code: "CROP_IS_NOT_FULLY_MATURED"
                        }
                    })
                }

                // Check if the user has already stolen from this tile
                const users = placedItemTile.plantInfo.thieves
                if (users.map((user) => user.toString()).includes(userId)) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.ThiefPlant,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("User already thief", {
                        extensions: {
                            code: "USER_ALREADY_THIEF"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const { energyConsume, experiencesGain } = this.staticService.activities.thiefPlant

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

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * COMPUTE THIEF QUANTITY
                 ************************************************************/
                // Crop randomness - using the correct property from staticService
                const { thief2, thief3 } = this.staticService.cropInfo.randomness

                const product = this.staticService.products.find(
                    (product) =>
                        product.type === ProductType.Crop &&
                        product.crop.toString() === placedItemTile.plantInfo.crop.toString()
                )
                if (!product) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND"
                        }
                    })
                }

                const crop = this.staticService.crops.find(
                    (crop) => crop.id.toString() === product.crop.toString()
                )
                if (!crop) {
                    throw new GraphQLError("Crop not found", {
                        extensions: {
                            code: "CROP_NOT_FOUND"
                        }
                    })
                }

                const { value: computedQuantity } = this.thiefService.compute({
                    thief2,
                    thief3
                })

                const actualQuantity = Math.min(
                    computedQuantity,
                    placedItemTile.plantInfo.harvestQuantityRemaining - crop.minHarvestQuantity
                )

                if (actualQuantity <= 0) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.ThiefPlant,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Thief quantity is less than minimum harvest quantity", {
                        extensions: {
                            code: "THIEF_QUANTITY_IS_LESS_THAN_MINIMUM_HARVEST_QUANTITY"
                        }
                    })
                }

                /************************************************************
                 * UPDATE INVENTORY AND USER DATA
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Product &&
                        inventoryType.product.toString() === product.id
                )
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }

                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                const { storageCapacity } = this.staticService.defaultInfo

                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity: actualQuantity,
                    userId: user.id,
                    occupiedIndexes
                })

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
            
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    const updatedSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: [inventory],
                        status: SchemaStatus.Updated
                    })
                    syncedInventories.push(...updatedSyncedInventories)
                }

                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                await user.save({ session })
                /************************************************************
                 * UPDATE CROP DATA
                 ************************************************************/
                placedItemTile.plantInfo.harvestQuantityRemaining =
                    placedItemTile.plantInfo.harvestQuantityRemaining - actualQuantity
                placedItemTile.plantInfo.thieves.push(new Types.ObjectId(userId))
                await placedItemTile.save({ session })
                const updatedSyncedPlacedItems = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemTile],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...updatedSyncedPlacedItems)

                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.ThiefPlant,
                    success: true,
                    userId,
                    data: { quantity: actualQuantity, productId: product.id }
                }

                // Commit the transaction automatically after all operations are successful
                return { quantity: actualQuantity }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Send success action message to Kafka
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId, placedItems: syncedPlacedItems })}]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: this.syncService.getSyncedUser(user) }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories })}]
                })
            ])

            return result
        } catch (error) {
            this.logger.error(error)

            if (actionMessage) {
                // Send failure action message in case of error
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
