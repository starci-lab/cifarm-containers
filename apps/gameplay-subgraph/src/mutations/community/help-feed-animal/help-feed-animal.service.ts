import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    AnimalCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, StaticService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { HelpFeedAnimalRequest } from "./help-feed-animal.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class HelpFeedAnimalService {
    private readonly logger = new Logger(HelpFeedAnimalService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly inventoryService: InventoryService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpFeedAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId, inventorySupplyId }: HelpFeedAnimalRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let neighborUserId: string | undefined
        try {
            await mongoSession.withTransaction(async (session) => {
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpFeedAnimal,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new GraphQLError("Placed item animal not found", {
                        extensions: {
                            code: "PLACED_ITEM_ANIMAL_NOT_FOUND"
                        }
                    })
                }

                neighborUserId = placedItemAnimal.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpFeedAnimal,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Cannot help feed another user's animal", {
                        extensions: {
                            code: "CANNOT_HELP_SELF"
                        }
                    })
                }

                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Hungry) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpFeedAnimal,
                        success: false,
                        userId,
                        reasonCode: 3
                    }
                    throw new GraphQLError("Animal is not hungry", {
                        extensions: {
                            code: "ANIMAL_NOT_HUNGRY"
                        }
                    })
                }

                const { energyConsume, experiencesGain } = this.staticService.activities.helpFeedAnimal

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Fetch inventory details
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new GraphQLError("Inventory type is not supply", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }

                if (inventoryType.displayId !== InventoryTypeId.AnimalFeed) {
                    throw new GraphQLError("Inventory supply is not animal feed", {
                        extensions: {
                            code: "INVALID_SUPPLY_TYPE"
                        }
                    })
                }

                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                const experiencesChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
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
                    quantity: 1
                })

                // Update or remove inventories in the database
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(session)
                }

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({
                        _id: { $in: removedInventories.map((inventory) => inventory._id) }
                    })
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
                    userId
                }

                // No return value needed for void
            })

            // Using Promise.all() to send Kafka messages concurrently
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId }) }]
                })
            ])

            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            // withTransaction automatically handles rollback
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
