import { ActionName, EmitActionPayload, HarvestFruitData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeId,
    PlacedItemSchema,
    PlacedItemType,
    ProductType,
    UserSchema
} from "@src/databases"
import {
    CoreService,
    EnergyService,
    InventoryService,
    LevelService,
    StaticService,
    SyncService
} from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { HarvestFruitRequest, HarvestFruitResponse } from "./harvest-fruit.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class HarvestFruitService {
    private readonly logger = new Logger(HarvestFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly coreService: CoreService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async harvestFruit(
        { id: userId }: UserLike,
        { placedItemFruitId }: HarvestFruitRequest
    ): Promise<HarvestFruitResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionMessage: EmitActionPayload<HarvestFruitData> | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * CHECK IF YOU HAVE CRATE IN TOOLBAR
                 ************************************************************/
                const inventoryCrateExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Crate),
                        kind: InventoryKind.Tool
                    })
                if (!inventoryCrateExisted) {
                    throw new GraphQLError("Crate not found in toolbar", {
                        extensions: {
                            code: "CRATE_NOT_FOUND_IN_TOOLBAR"
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

                // Validate fruit exists
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

                // Validate fruit is planted
                if (!placedItemFruit.fruitInfo) {
                    throw new GraphQLError("Fruit is not planted", {
                        extensions: {
                            code: "FRUIT_NOT_PLANTED"
                        }
                    })
                }

                // Validate fruit is fully matured
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured) {
                    throw new GraphQLError("Fruit is not fully matured", {
                        extensions: {
                            code: "FRUIT_NOT_FULLY_MATURED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume } = this.staticService.activities.harvestFruit

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
                 * RETRIEVE AND VALIDATE PRODUCT DATA
                 ************************************************************/

                // Get product data
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Fruit &&
                        placedItemType.id === placedItemFruit.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }
                const product = this.staticService.products.find((product) => {
                    return (
                        product.type === ProductType.Fruit &&
                        product.fruit.toString() === placedItemType.fruit.toString() &&
                        product.isQuality === placedItemFruit.fruitInfo.isQuality
                    )
                })

                // Validate product exists
                if (!product) {
                    throw new GraphQLError("Product not found from static data", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/

                // Get inventory type
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.product?.toString() === product.id.toString()
                )

                // Validate inventory type exists
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found from static data", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE FRUIT DATA
                 ************************************************************/

                // Get fruit data
                const fruit = this.staticService.fruits.find(
                    (fruit) => fruit.id === placedItemType.fruit.toString()
                )
                if (!fruit) {
                    throw new GraphQLError("Fruit not found from static data", {
                        extensions: {
                            code: "FRUIT_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/

                // Update user energy and experience
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                const experiencesGain = placedItemFruit.fruitInfo.isQuality
                    ? fruit.qualityHarvestExperiences
                    : fruit.basicHarvestExperiences
                    
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Get storage capacity setting
                const { storageCapacity } = this.staticService.defaultInfo

                // Harvest quantity
                const quantity = placedItemFruit.fruitInfo.harvestQuantityRemaining

                // Add the harvested fruit to the inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity,
                    userId: user.id,
                    occupiedIndexes
                })

                // Create new inventories
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

                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    const updatedSyncedInventories =
                        this.syncService.getCreatedOrUpdatedSyncedInventories({
                            inventories: [inventory],
                            status: SchemaStatus.Updated
                        })
                    syncedInventories.push(...updatedSyncedInventories)
                }

                // Handle perennial fruit growth cycle
                this.coreService.updatePlacedItemFruitAfterHarvest({
                    placedItemFruit,
                    fruit,
                    fruitInfo: this.staticService.fruitInfo
                })

                // Save user changes
                await user.save({ session })

                // Save placed item fruit changes
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
                    action: ActionName.HarvestFruit,
                    success: true,
                    userId,
                    data: {
                        productId: product.displayId,
                        quantity
                    }
                }

                return { quantity } // Return the quantity of harvested fruits
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
                        { value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }
                    ]
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
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [
                        { value: JSON.stringify({ userId, inventories: syncedInventories }) }
                    ]
                })
            ])

            return result // Return the result from the transaction
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
