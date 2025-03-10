import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    AnimalCurrentState,
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
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { FeedAnimalRequest, FeedAnimalResponse } from "./feed-animal.dto"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class FeedAnimalService {
    private readonly logger = new Logger(FeedAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async feedAnimal({ placedItemAnimalId, inventorySupplyId, userId }: FeedAnimalRequest): Promise<FeedAnimalResponse> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch placed item animal
                const placedItemAnimal = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) throw new GrpcNotFoundException("Placed Item animal not found")
                if (placedItemAnimal.user.toString() !== userId) throw new GrpcFailedPreconditionException("Cannot feed another user's animal")
                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Hungry) throw new GrpcFailedPreconditionException("Animal is not hungry")

                // Fetch system configuration
                const { value: { feedAnimal: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch user details
                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new GrpcNotFoundException("User not found")

                // Check if the user has sufficient energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Deduct energy and add experience
                const energyChanges = this.energyService.substract({ user, quantity: energyConsume })
                const experiencesChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

                // Fetch inventory details
                const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                if (!inventory) throw new GrpcNotFoundException("Inventory not found")

                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                if (!inventoryType || inventoryType.type !== InventoryType.Supply) throw new GrpcFailedPreconditionException("Inventory type is not supply")
                if (inventoryType.displayId !== InventoryTypeId.AnimalFeed) throw new GrpcFailedPreconditionException("Inventory supply is not animal feed")

                // Update user with energy and experience changes
                await this.connection.model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                    .session(session)

                // Get parameters for removing inventory
                const { inventories } = await this.inventoryService.getRemoveParams({
                    connection: this.connection,
                    userId: user.id,
                    session,
                    inventoryType,
                    kind: inventory.kind
                })

                // Remove the inventory
                const { removedInventories, updatedInventories } = this.inventoryService.remove({
                    inventories,
                    quantity: 1,
                })

                // Update or remove inventories in the database
                for (const inventory of updatedInventories) {
                    await this.connection.model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(session)
                }

                await this.connection.model<InventorySchema>(InventorySchema.name)
                    .deleteMany({ _id: { $in: removedInventories.map(inventory => inventory._id) } })
                    .session(session)

                // Update animal state after feeding
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({ session })

                // Prepare action message
                actionMessage = {
                    placedItemId: placedItemAnimalId,
                    action: ActionName.FeedAnimal,
                    success: true,
                    userId,
                }

                return {} // Return an empty object as the response
            })

            // Send Kafka messages
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
            throw new GrpcInternalException(error.message)
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
