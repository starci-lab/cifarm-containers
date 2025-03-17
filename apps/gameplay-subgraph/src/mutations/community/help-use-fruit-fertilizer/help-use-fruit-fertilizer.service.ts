import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
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
import { HelpUseFruitFertilizerRequest } from "./help-use-fruit-fertilizer.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class HelpUseFruitFertilizerService {
    private readonly logger = new Logger(HelpUseFruitFertilizerService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService
    ) {}

    async helpUseFruitFertilizer(
        { id: userId }: UserLike,
        { placedItemFruitId, inventorySupplyId }: HelpUseFruitFertilizerRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let neighborUserId: string | undefined
        try {
            await mongoSession.withTransaction(async (session) => {
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)

                if (!placedItemFruit) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.HelpUseFruitFertilizer,
                        success: false,
                        userId,
                        reasonCode: 0,
                    }
                    throw new GraphQLError("Placed item fruit not found", {
                        extensions: {
                            code: "PLACED_ITEM_FRUIT_NOT_FOUND"
                        }
                    })
                }

                neighborUserId = placedItemFruit.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.HelpUseFruitFertilizer,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new GraphQLError("Cannot help use fruit fertilizer on your own tile", {
                        extensions: {
                            code: "CANNOT_HELP_SELF"
                        }
                    })
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.NeedFertilizer) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.HelpUseFruitFertilizer,
                        success: false,
                        userId,
                        reasonCode: 3,
                    }
                    throw new GraphQLError("Fruit does not need fertilizer", {
                        extensions: {
                            code: "FRUIT_NOT_NEED_FERTILIZER"
                        }
                    })
                }

                const { energyConsume, experiencesGain } = this.staticService.activities.helpUseFruitFertilizer
                
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

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new GraphQLError("Inventory type is not supply", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }

                if (inventoryType.displayId !== InventoryTypeId.FruitFertilizer) {
                    throw new GraphQLError("Inventory supply is not fruit fertilizer", {
                        extensions: {
                            code: "INVALID_SUPPLY_TYPE"
                        }
                    })
                }

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


                // Update the user and placed item fruit in one session
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                    .session(session)

                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({
                    session
                })

                // Kafka producer actions (sending them in parallel)
                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.HelpUseFruitFertilizer,
                    success: true,
                    userId,
                }

                // No return value needed for void
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

            // No return value needed for void
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
            await mongoSession.endSession()
        }
    }
}
