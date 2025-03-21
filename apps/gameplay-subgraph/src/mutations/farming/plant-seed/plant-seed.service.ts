import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventorySchema,
    InventoryType,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, PlacedItemService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { PlantSeedRequest } from "./plant-seed.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { DeepPartial, SchemaStatus, WithStatus } from "@src/common"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly placedItemService: PlacedItemService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async plantSeed(
        { id: userId }: UserLike,
        { inventorySeedId, placedItemTileId }: PlantSeedRequest
    ): Promise<void> {
        this.logger.debug(`Planting seed for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        
        // synced variables
        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE SEED INVENTORY
                 ************************************************************/
                
                // Get seed inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySeedId)
                    .session(session)
                
                // Validate inventory exists
                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }
                
                // Get inventory type seed from static data
                const inventoryTypeSeed = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id === inventory.inventoryType.toString()
                )
                
                // Validate inventory type seed exists in static data
                if (!inventoryTypeSeed) {
                    throw new GraphQLError("Inventory type seed not found from static data", {
                        extensions: {
                            code: "INVENTORY_TYPE_SEED_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                // Validate inventory type is a seed
                if (inventoryTypeSeed.type !== InventoryType.Seed) {
                    throw new GraphQLError("Inventory type is not a seed", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_SEED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TILE
                 ************************************************************/
                
                // Get placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)
                
                syncedPlacedItemAction = {
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    id: placedItemTile.id,
                    placedItemType: placedItemTile.placedItemType
                }
                

                // Validate tile exists
                if (!placedItemTile) {
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }
                
                // Validate ownership
                if (placedItemTile.user.toString() !== userId) {
                    throw new GraphQLError("Cannot plant seed on another user's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_PLANTING"
                        }
                    })
                }
                
                // Validate tile is not already planted
                if (placedItemTile.seedGrowthInfo) {
                    throw new GraphQLError("Tile is already planted", {
                        extensions: {
                            code: "TILE_ALREADY_PLANTED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                
                // Get user data
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
                
                // Validate user exists
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE ACTIVITY DATA
                 ************************************************************/
                
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.plantSeed
                
                // Validate energy is sufficient
                if (user.energy < energyConsume) {
                    throw new GraphQLError("Not enough energy", {
                        extensions: {
                            code: "ENERGY_NOT_ENOUGH"
                        }
                    })
                }

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE CROP DATA
                 ************************************************************/
                
                // Get crop data
                const crop = this.staticService.crops.find(
                    (crop) => crop.id.toString() === inventoryTypeSeed.crop?.toString()
                )
                
                // Validate crop exists in static data
                if (!crop) {
                    throw new GraphQLError("Crop not found from static data", {
                        extensions: {
                            code: "CROP_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/
                
                // Update user energy and experience
                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Remove seed from inventory
                const { inventories } = await this.inventoryService.getRemoveParams({
                    connection: this.connection,
                    userId: user.id,
                    session,
                    inventoryType: inventoryTypeSeed,
                    kind: inventory.kind
                })

                const { removedInventories, updatedInventories } = this.inventoryService.remove({
                    inventories,
                    quantity: 1
                })

                console.log(updatedInventories, removedInventories)

                // Save updated inventories
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    // add synced inventory to syncedInventories
                    const updatedSyncedInventories = this.inventoryService.getCreatedOrUpdatedSyncedInventories({
                        inventories: [inventory],
                        status: SchemaStatus.Updated
                    })
                    syncedInventories.push(...updatedSyncedInventories)
                }

                // Delete removed inventories
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({
                        _id: { $in: removedInventories.map((inventory) => inventory._id) }
                    })
                    .session(session)

                // add synced inventory to syncedInventories
                const deletedSyncedInventories = this.inventoryService.getDeletedSyncedInventories({
                    inventoryIds: removedInventories.map((inventory) => inventory.id)
                })
                syncedInventories.push(...deletedSyncedInventories)

                // Save user changes
                await user.save({ session })
                
                // Update tile with seed info
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemTileId },
                        {
                            seedGrowthInfo: {
                                crop: crop.id.toString(),
                            }
                        }
                    )
                    .session(session)
                const updatedPlacedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)
                // add synced placed item to syncedPlacedItems
                const updatedSyncedPlacedItems = this.placedItemService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [updatedPlacedItemTile],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...updatedSyncedPlacedItems)


                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.PlantSeed,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: user.toJSON() }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)

            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
