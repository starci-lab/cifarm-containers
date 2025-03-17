import { Injectable, Logger } from "@nestjs/common"
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
import { Connection } from "mongoose"
import { UseFruitFertilizerRequest } from "./use-fruit-fertilizer.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UseFruitFertilizerService {
    private readonly logger = new Logger(UseFruitFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async useFruitFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemFruitId }: UseFruitFertilizerRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession() // Create session

        let actionMessage: EmitActionPayload | undefined
        try {
            // Using withTransaction to manage transaction lifecycle
            await mongoSession.withTransaction(async (session) => {
                // Fetch inventory and inventoryType
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findById(inventory.inventoryType)
                    .session(session)

                // Fetch the placed item tile and check conditions
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)   

                if (!placedItemFruit) {
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }

                if (placedItemFruit.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use fruit fertilizer on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_FRUIT_FERTILIZER"
                        }
                    })
                }

                if (!placedItemFruit.fruitInfo) {
                    throw new GraphQLError("Tile has no fruit tree", {
                        extensions: {
                            code: "NO_FRUIT_TREE"
                        }
                    })
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.NeedFertilizer) {
                    throw new GraphQLError("Tile does not need fertilizer", {
                        extensions: {
                            code: "TILE_DOES_NOT_NEED_FERTILIZER"
                        }
                    })
                }

                // Fetch system settings for fertilizer action
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.useFruitFertilizer

                // Fetch the user and check energy
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Validate inventory type
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new GraphQLError("Inventory type is not supply", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }

                if (inventoryType.displayId !== InventoryTypeId.FruitFertilizer) {
                    throw new GraphQLError("Inventory supply is not Fruit Fertilizer", {
                        extensions: {
                            code: "INVALID_FERTILIZER_TYPE"
                        }
                    })
                }

                // Deduct energy and add experience
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                const experienceChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
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
                    quantity: 1
                })

                // Update inventories
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

                // Update placed item tile
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({ session })

                // Prepare success action message
                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.UseFruitFertilizer,
                    success: true,
                    userId
                }

                // No return value needed for void
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

            // No return value needed for void
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
