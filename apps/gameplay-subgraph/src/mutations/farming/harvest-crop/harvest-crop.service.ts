import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    Activities,
    CropCurrentState,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    PlacedItemSchema,
    SEED_GROWTH_INFO,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema,
    CropSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload, HarvestCropData } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"

@Injectable()
export class HarvestCropService {
    private readonly logger = new Logger(HarvestCropService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
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
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .populate(SEED_GROWTH_INFO)
                    .session(session)

                if (!placedItemTile) throw new NotFoundException("Tile not found")
                if (!placedItemTile.seedGrowthInfo)
                    throw new BadRequestException("Tile is not planted")
                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured)
                    throw new BadRequestException("Crop is not fully matured")

                // Fetch system settings
                const {
                    value: {
                        harvestCrop: { energyConsume, experiencesGain }
                    }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new NotFoundException("User not found")

                // Check if the user has sufficient energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Deduct energy and add experience
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                const experienceChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Fetch inventory type for the harvested crop
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Product,
                        product: placedItemTile.seedGrowthInfo.crop
                    })
                    .session(session)

                if (!inventoryType) throw new NotFoundException("Inventory type not found")

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Fetch storage capacity setting
                const {
                    value: { storageCapacity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))

                // Update user with energy and experience changes
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experienceChanges })
                    .session(session)

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

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session })

                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne(
                            {
                                _id: inventory._id
                            },
                            inventory
                        )
                        .session(session)
                }

                // Fetch crop details to update perennial count
                const crop = await this.connection
                    .model<CropSchema>(CropSchema.name)
                    .findById(placedItemTile.seedGrowthInfo.crop)
                    .session(session)

                if (!crop) throw new NotFoundException("Crop not found")

                // Handle perennial crop growth cycle
                if (placedItemTile.seedGrowthInfo.currentPerennialCount < crop.perennialCount) {
                    placedItemTile.seedGrowthInfo.currentPerennialCount += 1
                    placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                    placedItemTile.seedGrowthInfo.currentStage = crop.nextGrowthStageAfterHarvest
                    placedItemTile.seedGrowthInfo.currentStageTimeElapsed = 0
                } else {
                    placedItemTile.seedGrowthInfo = null // End of the plant's life cycle
                }

                // Update the placed item tile with new seed growth information
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemTile._id },
                        {
                            seedGrowthInfo: placedItemTile.seedGrowthInfo
                        }
                    )
                    .session(session)

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
            
            // Send Kafka messages for success
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

            // Send failure action message if any error occurs
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // withTransaction handles rollback automatically, no need for manual abort
            throw error // Rethrow error to be handled higher up
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
