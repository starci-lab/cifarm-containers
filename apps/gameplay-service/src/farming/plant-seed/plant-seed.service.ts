import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Activities, CropCurrentState, CropSchema, InjectMongoose, InventorySchema, InventoryTypeSchema, PlacedItemSchema, SystemId, KeyValueRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async plantSeed({ inventorySeedId, placedItemTileId, userId }: PlantSeedRequest): Promise<PlantSeedResponse> {
        this.logger.debug(`Planting seed for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession() // Create session
        let actionMessage: EmitActionPayload | undefined

        try {
            // Using withTransaction to manage the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch inventory and inventoryType
                const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySeedId)
                    .session(session)

                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                // Fetch the placed item tile and check conditions
                const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
                if (placedItemTile.user.toString() !== userId) throw new GrpcFailedPreconditionException("Cannot plant seed on another user's tile")
                if (placedItemTile.seedGrowthInfo) throw new GrpcFailedPreconditionException("Tile is already planted")

                // Fetch system settings for planting seed
                const { value: { plantSeed: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch the user
                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new GrpcNotFoundException("User not found")

                // Check if the user has sufficient energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Deduct energy and add experience points
                const energyChanges = this.energyService.substract({ user, quantity: energyConsume })
                const experiencesChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

                // Fetch the crop for the seed
                const crop = await this.connection.model<CropSchema>(CropSchema.name)
                    .findById(inventoryType.crop)
                    .session(session)

                if (!crop) throw new GrpcNotFoundException("Crop not found")

                // Update user with energy and experience changes
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...energyChanges, ...experiencesChanges }
                ).session(session)

                // Remove the seed from the user's inventory
                const { inventories } = await this.inventoryService.getRemoveParams({
                    connection: this.connection,
                    userId: user.id,
                    session,
                    inventoryType,
                    kind: inventory.kind
                })

                const { removedInventories, updatedInventories } = this.inventoryService.remove({
                    inventories,
                    quantity: 1,
                })

                // Update inventories
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(session)
                }

                // Delete removed inventories
                await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                    _id: { $in: removedInventories.map(inventory => inventory._id) }
                }).session(session)

                // Update the placed item tile with seed growth info
                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                    { _id: placedItemTile._id },
                    { seedGrowthInfo: {
                        crop: crop.id,
                        harvestQuantityRemaining: crop.maxHarvestQuantity,
                        currentState: CropCurrentState.Normal,
                    }}
                ).session(session)

                // Prepare success action message
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.PlantSeed,
                    success: true,
                    userId,
                }

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

                return {} // Return empty success response
            })

            return result // Return successful result
        } catch (error) {
            this.logger.error(error)

            // Send failure message if the action was started
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // Since withTransaction handles rollback, no need for manual abort
            throw error // Re-throw the error to be handled higher up
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
