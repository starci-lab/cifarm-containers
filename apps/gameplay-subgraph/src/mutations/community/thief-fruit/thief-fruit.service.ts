import { ActionName, EmitActionPayload, ThiefFruitData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    PlacedItemSchema,
    ProductType,
    UserSchema,
    InventoryKind,
    InventoryTypeId,
    PlacedItemType
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    ThiefService,
    StaticService,
    SyncService
} from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection, Types } from "mongoose"
import { ThiefFruitRequest, ThiefFruitResponse } from "./thief-fruit.dto"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class ThiefFruitService {
    private readonly logger = new Logger(ThiefFruitService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async thiefFruit(
        { id: userId }: UserLike,
        { placedItemFruitId }: ThiefFruitRequest
    ): Promise<ThiefFruitResponse> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionMessage: EmitActionPayload<ThiefFruitData> | undefined
        let user: UserSchema | undefined
        let neighborUserId: string | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE CRATE TOOL
                 ************************************************************/

                // Check if user has crate
                const inventoryCrateExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Crate),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                // Validate crate exists in inventory
                if (!inventoryCrateExisted) {
                    throw new GraphQLError("Crate not found in toolbar", {
                        extensions: {
                            code: "CRATE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM FRUIT
                 ************************************************************/
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)
      
                if (!placedItemFruit) {
                    throw new GraphQLError("Fruit not found", {
                        extensions: {
                            code: "FRUIT_NOT_FOUND"
                        }
                    })
                }

                syncedPlacedItemAction = {
                    id: placedItemFruitId,
                    placedItemType: placedItemFruit.placedItemType,
                    x: placedItemFruit.x,
                    y: placedItemFruit.y
                }

                neighborUserId = placedItemFruit.user.toString()
                if (neighborUserId === userId) {
                    throw new GraphQLError("Cannot thief from your own fruit", {
                        extensions: {
                            code: "UNAUTHORIZED_THIEF"
                        }
                    })
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured) {
                    throw new GraphQLError("Fruit is not FullyMatured", {
                        extensions: {
                            code: "FRUIT_NOT_MATURED"
                        }
                    })
                }

                const users = placedItemFruit.fruitInfo.thieves
                if (users.map((user) => user.toString()).includes(userId)) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.ThiefFruit,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("User already thief", {
                        extensions: {
                            code: "ALREADY_THIEF"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const { energyConsume, experiencesGain } = this.staticService.activities.thiefFruit

                user = await this.connection
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

                /************************************************************
                 * COMPUTE THIEF QUANTITY
                 ************************************************************/
                // Fruit randomness - using the correct property from staticService
                const { thief2, thief3 } = this.staticService.fruitInfo.randomness

                const { value: computedQuantity } = this.thiefService.compute({
                    thief2,
                    thief3
                })

                const actualQuantity = Math.min(
                    computedQuantity,
                    placedItemFruit.fruitInfo.harvestQuantityRemaining
                )

                if (actualQuantity <= 0) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.ThiefFruit,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Thief quantity is less than minimum yield quantity", {
                        extensions: {
                            code: "THIEF_QUANTITY_LESS_THAN_MINIMUM_YIELD_QUANTITY"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE PRODUCT AND INVENTORY TYPE
                 ************************************************************/
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Fruit &&
                        placedItemType.id === placedItemFruit.placedItemType.toString()
                )
                const product = this.staticService.products.find(
                    (product) =>
                        product.type === ProductType.Fruit &&
                        product.fruit.toString() === placedItemType.fruit.toString() &&
                        product.isQuality === placedItemFruit.fruitInfo.isQuality
                )

                if (!product) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND"
                        }
                    })
                }

                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Product &&
                        inventoryType.product.toString() === product.id
                )

                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * UPDATE INVENTORY AND USER DATA
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                const { storageCapacity } = this.staticService.defaultInfo

                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity: actualQuantity,
                    userId: user.id,
                    occupiedIndexes
                })

                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                    const createdSyncedInventories =
                        this.syncService.getCreatedOrUpdatedSyncedInventories({
                            inventories: createdInventoryRaws,
                            status: SchemaStatus.Created
                        })
                    syncedInventories.push(...createdSyncedInventories)
                }

                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    const updatedSyncedInventory =
                        this.syncService.getCreatedOrUpdatedSyncedInventories({
                            inventories: [inventory],
                            status: SchemaStatus.Updated
                        })
                    syncedInventories.push(...updatedSyncedInventory)
                }

                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })

                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                await user.save({ session })

                /************************************************************
                 * UPDATE FRUIT DATA
                 ************************************************************/
                placedItemFruit.fruitInfo.harvestQuantityRemaining -= actualQuantity
                placedItemFruit.fruitInfo.thieves.push(new Types.ObjectId(userId))
                await placedItemFruit.save({ session })
                const updatedSyncedPlacedItems = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemFruit],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...updatedSyncedPlacedItems)

                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.ThiefFruit,
                    success: true,
                    userId,
                    data: {
                        quantity: actualQuantity,
                        productId: product?.displayId
                    }
                }

                return { quantity: actualQuantity }
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
                    messages: [
                        {
                            value: JSON.stringify({
                                userId: neighborUserId,
                                placedItems: syncedPlacedItems
                            })
                        }
                    ]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories })}]
                }), 
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId,
                                user: this.syncService.getSyncedUser(user)
                            })
                        }
                    ]
                })
            ])

            return result
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                // Send failure action message in case of error
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
