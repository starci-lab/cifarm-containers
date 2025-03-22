import { Injectable, Logger } from "@nestjs/common"
import {
    FruitCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    StaticService,
    SyncService
} from "@src/gameplay"
import { Connection } from "mongoose"
import { UseFruitFertilizerRequest } from "./use-fruit-fertilizer.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { DeepPartial, SchemaStatus, WithStatus } from "@src/common"

@Injectable()
export class UseFruitFertilizerService {
    private readonly logger = new Logger(UseFruitFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async useFruitFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemFruitId }: UseFruitFertilizerRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                 ************************************************************/

                // Get inventory supply
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
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id === inventory.inventoryType.toString()
                )

                // Validate inventory type exists and is a supply
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new GraphQLError("Inventory type is not supply", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }

                // Validate inventory type is fruit fertilizer
                if (inventoryType.displayId !== InventoryTypeId.FruitFertilizer) {
                    throw new GraphQLError("Inventory supply is not Fruit Fertilizer", {
                        extensions: {
                            code: "INVALID_FERTILIZER_TYPE"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM FRUIT
                 ************************************************************/

                // Get placed item fruit
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)
                syncedPlacedItemAction = {
                    id: placedItemFruitId,
                    placedItemType: placedItemFruit.placedItemType,
                    x: placedItemFruit.x,
                    y: placedItemFruit.y
                }

                // Validate placed item fruit exists
                if (!placedItemFruit) {
                    throw new GraphQLError("Placed item fruit not found", {
                        extensions: {
                            code: "PLACED_ITEM_FRUIT_NOT_FOUND"
                        }
                    })
                }

                // Validate ownership
                if (placedItemFruit.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use fruit fertilizer on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_FRUIT_FERTILIZER"
                        }
                    })
                }

                // Validate tile has fruit tree
                if (!placedItemFruit.fruitInfo) {
                    throw new GraphQLError("Tile has no fruit tree", {
                        extensions: {
                            code: "NO_FRUIT_TREE"
                        }
                    })
                }

                // Validate tile needs fertilizer
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.NeedFertilizer) {
                    throw new GraphQLError("Tile does not need fertilizer", {
                        extensions: {
                            code: "TILE_DOES_NOT_NEED_FERTILIZER"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.useFruitFertilizer

                // Get user data
                user = await this.connection
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

                await user.save({ session })
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
                    await inventory.save({ session })
                    const updatedSyncedInventories =
                        this.syncService.getCreatedOrUpdatedSyncedInventories({
                            inventories: [inventory],
                            status: SchemaStatus.Updated
                        })
                    syncedInventories.push(...updatedSyncedInventories)
                }

                // Delete removed inventories
                if (removedInventories.length > 0) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteMany({
                            _id: { $in: removedInventories.map((inventory) => inventory._id) }
                        })
                        .session(session)
                    const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                        inventoryIds: removedInventories.map((inventory) => inventory.id)
                    })
                    syncedInventories.push(...deletedSyncedInventories)
                }

                // Update placed item tile
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({ session })
                const updatedSyncedPlacedItems =
                    this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                        placedItems: [placedItemFruit],
                        status: SchemaStatus.Updated
                    })
                syncedPlacedItems.push(...updatedSyncedPlacedItems)

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.UseFruitFertilizer,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/

            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: this.syncService.getSyncedUser(user) }) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)

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
