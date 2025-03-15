import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    ANIMAL_INFO,
    AnimalCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { HelpFeedAnimalRequest, HelpFeedAnimalResponse } from "./help-feed-animal.dto"

@Injectable()
export class HelpFeedAnimalService {
    private readonly logger = new Logger(HelpFeedAnimalService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
    ) {}

    async helpFeedAnimal({ placedItemAnimalId, inventorySupplyId, userId }: HelpFeedAnimalRequest): Promise<HelpFeedAnimalResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let neighborUserId: string | undefined
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .populate(ANIMAL_INFO)
                    .session(session)

                if (!placedItemAnimal) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpFeedAnimal,
                        success: false,
                        userId,
                        reasonCode: 0,
                    }
                    throw new GrpcNotFoundException("Placed item animal not found")
                }

                neighborUserId = placedItemAnimal.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpFeedAnimal,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new GrpcFailedPreconditionException("Cannot help use bug net on your own tile")
                }

                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Hungry) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpFeedAnimal,
                        success: false,
                        userId,
                        reasonCode: 3,
                    }
                    throw new GrpcFailedPreconditionException("Animal is not hungry")
                }

                const { value } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById(createObjectId(SystemId.Activities))
                    .session(session)
                
                const { helpFeedAnimal: { energyConsume, experiencesGain } } = value as Activities

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume,
                })

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
                

                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume,
                })
                const experiencesChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain,
                })

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


                // Update the user and placed item animal in one session
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                    .session(session)

                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({
                    session
                })

                // Kafka producer actions (sending them in parallel)
                actionMessage = {
                    placedItemId: placedItemAnimalId,
                    action: ActionName.HelpFeedAnimal,
                    success: true,
                    userId,
                }

                return {} // Return empty response after success
            })

            // Using Promise.all() to send Kafka messages concurrently
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId }) }],
                }),
            ])

            return result // Return the result from the transaction
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                })
            }
            // withTransaction automatically handles rollback
            throw error
        } finally {
            await mongoSession.endSession() // End the session after transaction completes
        }
    }
}
