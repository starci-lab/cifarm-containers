import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, EmptyObjectType } from "@src/common"
import {
    Activities,
    FRUIT_INFO,
    FruitCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    KeyValueRecord,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { UseFruitFertilizerRequest } from "./use-fruit-fertilizer.dto"
import { UserLike } from "@src/jwt"

@Injectable()
export class UseFruitFertilizerService {
    private readonly logger = new Logger(UseFruitFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async useFruitFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemFruitId }: UseFruitFertilizerRequest
    ): Promise<EmptyObjectType> {
        this.logger.debug(`Applying fruit fertilizer for user ${userId}, tile ID: ${placedItemFruitId}`)

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
                const placedItemFruit = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .populate(FRUIT_INFO)
                    .session(session)

                if (!placedItemFruit) throw new NotFoundException("Fruit not found")
                if (!placedItemFruit.fruitInfo) throw new NotFoundException("Fruit is not planted")

                // Fetch system settings for fertilizer action
                const { value: { useFruitFertilizer: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch the user and check energy
                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new NotFoundException("User not found")

                this.energyService.checkSufficient({ current: user.energy, required: energyConsume })

                // Validate inventory type
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) throw new BadRequestException("Inventory type is not supply")
                if (inventoryType.displayId !== InventoryTypeId.FruitFertilizer) throw new BadRequestException("Inventory supply is not Fruit Fertilizer")

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
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({ session })

                // Prepare success action message
                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.UseFruitFertilizer,
                    success: true,
                    userId,
                }

                return {} // Success response
            })

            // Send Kafka messages for success
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ placedItemFruitId }) }]
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
