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
import { FeedAnimalRequest } from "./feed-animal.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class FeedAnimalService {
    private readonly logger = new Logger(FeedAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async feedAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId, inventorySupplyId }: FeedAnimalRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                
                // Get placed item animal
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                // Validate animal exists
                if (!placedItemAnimal) {
                    throw new GraphQLError("Placed Item animal not found", {
                        extensions: {
                            code: "PLACED_ITEM_ANIMAL_NOT_FOUND"
                        }
                    })
                }
                
                // Validate ownership
                if (placedItemAnimal.user.toString() !== userId) {
                    throw new GraphQLError("Cannot feed another user's animal", {
                        extensions: {
                            code: "CANNOT_FEED_OTHERS_ANIMAL"
                        }
                    })
                }
                
                // Validate animal is hungry
                if (placedItemAnimal.animalInfo?.currentState !== AnimalCurrentState.Hungry) {
                    throw new GraphQLError("Animal is not hungry", {
                        extensions: {
                            code: "ANIMAL_NOT_HUNGRY"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE ACTIVITY DATA
                 ************************************************************/
                
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.feedAnimal
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                
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
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                 ************************************************************/
                
                // Get inventory data
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                // Validate inventory exists
                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                // Get inventory type
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                // Validate inventory type is supply
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new GraphQLError("Inventory type is not supply", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }
                
                // Validate inventory is animal feed
                if (inventoryType.displayId !== InventoryTypeId.AnimalFeed) {
                    throw new GraphQLError("Inventory supply is not animal feed", {
                        extensions: {
                            code: "INVALID_SUPPLY_TYPE"
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

                // Update user with energy and experience changes
                await user.save({ session })

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

                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(session)
                }

                // Delete removed inventories
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({
                        _id: { $in: removedInventories.map((inventory) => inventory._id) }
                    })
                    .session(session)

                // Update animal state after feeding
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({ session })

                // Prepare action message
                actionMessage = {
                    placedItemId: placedItemAnimalId,
                    action: ActionName.FeedAnimal,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            
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
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
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
