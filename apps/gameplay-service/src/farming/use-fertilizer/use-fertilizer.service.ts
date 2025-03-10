import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    KeyValueRecord,
    PlacedItemSchema,
    SEED_GROWTH_INFO,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UseFertilizerRequest, UseFertilizerResponse } from "./use-fertilizer.dto"
import { Producer } from "kafkajs"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async useFertilizer({ inventorySupplyId, placedItemTileId, userId }: UseFertilizerRequest): Promise<UseFertilizerResponse> {
        this.logger.debug(`Applying fertilizer for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession() // Create session

        let actionMessage: EmitActionPayload | undefined
        try {
            // Using withTransaction to manage transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch inventory and inventoryType
                const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                // Fetch the placed item tile and check conditions
                const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .populate(SEED_GROWTH_INFO)
                    .session(session)

                if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
                if (!placedItemTile.seedGrowthInfo) throw new GrpcNotFoundException("Tile is not planted")
                if (placedItemTile.seedGrowthInfo.isFertilized) throw new GrpcFailedPreconditionException("Tile is already fertilized")

                // Fetch system settings for fertilizer action
                const { value: { useFertilizer: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch the user and check energy
                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new GrpcNotFoundException("User not found")

                this.energyService.checkSufficient({ current: user.energy, required: energyConsume })

                // Validate inventory type
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) throw new GrpcFailedPreconditionException("Inventory type is not supply")
                if (inventoryType.displayId !== InventoryTypeId.BasicFertilizer) throw new GrpcFailedPreconditionException("Inventory supply is not BasicFertilizer")

                // Deduct energy and add experience
                const energyChanges = this.energyService.substract({ user, quantity: energyConsume })
                const experienceChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

                await this.connection.model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experienceChanges })
                    .session(session)

                // Remove fertilizer from inventory
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

                // Update placed item tile
                placedItemTile.seedGrowthInfo.isFertilized = true
                await placedItemTile.save({ session })

                // Prepare success action message
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.UseFertilizer,
                    success: true,
                    userId,
                }

                return {} // Success response
            })

            // Send Kafka messages for success
            Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ placedItemTileId }) }]
                })
            ])


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
