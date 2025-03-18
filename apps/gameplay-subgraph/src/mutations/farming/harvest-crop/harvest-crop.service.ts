import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    CropCurrentState,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    PlacedItemSchema,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema,
    InventoryTypeId,
    InventoryKind
} from "@src/databases"
import { CoreService, EnergyService, InventoryService, LevelService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload, HarvestCropData } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class HarvestCropService {
    private readonly logger = new Logger(HarvestCropService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly coreService: CoreService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async harvestCrop(
        { id: userId }: UserLike,
        { placedItemTileId }: HarvestCropRequest
    ): Promise<HarvestCropResponse> {
        this.logger.debug(
            `Harvesting crop for user ${userId}, tile ID: ${placedItemTileId}`
        )

        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<HarvestCropData> | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * CHECK IF YOU HAVE CRATE IN TOOLBAR
                 ************************************************************/
                const inventoryCrateExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Crate),
                        kind: InventoryKind.Tool
                    })
                if (!inventoryCrateExisted) {
                    throw new GraphQLError("Crate not found in toolbar", {
                        extensions: {
                            code: "CRATE_NOT_FOUND_IN_TOOLBAR"
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
                
                // Validate placed item tile exists
                if (!placedItemTile) {
                    throw new GraphQLError("Placed item tile not found", {
                        extensions: {
                            code: "PLACED_ITEM_TILE_NOT_FOUND"
                        }
                    })
                }
                
                // Validate tile is planted
                if (!placedItemTile.seedGrowthInfo) {
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_IS_NOT_PLANTED"
                        }
                    })
                }
                
                // Validate crop is fully matured
                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured) {
                    throw new GraphQLError("Crop is not fully matured", {
                        extensions: {
                            code: "CROP_IS_NOT_FULLY_MATURED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.harvestCrop
                
                // Get user data
                const user = await this.connection
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
                
                // Validate energy is sufficient
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                
                // Get inventory type for the harvested crop
                // const inventoryType = await this.connection
                //     .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                //     .findOne({
                //         type: InventoryType.Product,
                //         product: placedItemTile.seedGrowthInfo.crop
                //     })
                //     .session(session)
                const product = this.staticService.products.find(
                    (product) => product.crop && product.crop.toString() === placedItemTile.seedGrowthInfo.crop.toString()
                    && product.isQuality === placedItemTile.seedGrowthInfo.isQuality
                )
                if (!product) {
                    throw new GraphQLError("Product not found in static data", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND_IN_STATIC_DATA"
                        }
                    })
                }
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.product && inventoryType.product.toString() === product.id.toString()
                )
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found in static data", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND_IN_STATIC_DATA"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE STORAGE CAPACITY
                 ************************************************************/
                
                // Get storage capacity setting
                const systemInfo = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                
                // Validate system info exists
                if (!systemInfo || !systemInfo.value) {
                    throw new GraphQLError("System info not found", {
                        extensions: {
                            code: "SYSTEM_INFO_NOT_FOUND"
                        }
                    })
                }
                
                const { storageCapacity } = systemInfo.value

                /************************************************************
                 * RETRIEVE AND VALIDATE CROP DATA
                 ************************************************************/
                
                // Get crop data
                // const crop = await this.connection
                //     .model<CropSchema>(CropSchema.name)
                //     .findById(placedItemTile.seedGrowthInfo.crop)
                //     .session(session)
                const crop = this.staticService.crops.find(crop => crop.id === placedItemTile.seedGrowthInfo.crop.toString())
                if (!crop) {
                    throw new GraphQLError("Crop not found in static data", {
                        extensions: {
                            code: "CROP_NOT_FOUND_IN_STATIC_DATA"
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

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Harvest quantity
                const quantity = placedItemTile.seedGrowthInfo.harvestQuantityRemaining

                // Add the harvested crop to the inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity,
                    userId: user.id,
                    occupiedIndexes
                })

                // Create new inventories
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session })

                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                }

                // Handle perennial crop growth cycle
                this.coreService.updatePlacedItemTileAfterHarvest({
                    placedItemTile,
                    crop,
                    cropInfo: this.staticService.cropInfo
                })
                
                // Save user changes
                await user.save({ session })
                
                // Save placed item tile changes
                await placedItemTile.save({ session })

                // Prepare action message
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HarvestCrop,
                    success: true,
                    userId,
                    data: {
                        cropId: crop.id,
                        quantity
                    }
                }

                return { quantity } // Return the quantity of harvested crops
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
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])

            return result // Return the result from the transaction
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
