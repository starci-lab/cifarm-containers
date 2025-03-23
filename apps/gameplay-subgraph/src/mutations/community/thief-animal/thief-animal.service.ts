import { ActionName, EmitActionPayload, ThiefAnimalProductData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    AnimalCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    PlacedItemSchema,
    ProductType,
    UserSchema,
    InventoryKind,
    InventoryTypeId
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
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, SchemaStatus, WithStatus, DeepPartial } from "@src/common"
import { ThiefAnimalRequest, ThiefAnimalResponse } from "./thief-animal.dto"
@Injectable()
export class ThiefAnimalService {
    private readonly logger = new Logger(ThiefAnimalService.name)

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

    async thiefAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId }: ThiefAnimalRequest
    ): Promise<ThiefAnimalResponse> {
        const mongoSession = await this.connection.startSession()
       
        // synced variables
        let actionMessage: EmitActionPayload<ThiefAnimalProductData> | undefined
        let user: UserSchema | undefined
        let neighborUserId: string | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []     
        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []

        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
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
                    .session(mongoSession)

                // Validate crate exists in inventory
                if (!inventoryCrateExisted) {
                    throw new GraphQLError("Crate not found in toolbar", {
                        extensions: {
                            code: "CRATE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(mongoSession)

                if (!placedItemAnimal) {
                    throw new GraphQLError("Animal not found", {
                        extensions: {
                            code: "ANIMAL_NOT_FOUND"
                        }
                    })
                }

                syncedPlacedItemAction = {
                    id: placedItemAnimalId,
                    placedItemType: placedItemAnimal.placedItemType,
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y
                }   

                neighborUserId = placedItemAnimal.user.toString()
                if (neighborUserId === userId) {
                    throw new GraphQLError("Cannot thief from your own animal", {
                        extensions: {
                            code: "UNAUTHORIZED_THIEF"
                        }
                    })
                }

                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
                    throw new GraphQLError("Animal is not yielding", {
                        extensions: {
                            code: "ANIMAL_NOT_YIELDING"
                        }
                    })
                }

                const users = placedItemAnimal.animalInfo.thieves
                if (users.map((user) => user.toString()).includes(userId)) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.ThiefAnimalProduct,
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
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.thiefAnimal
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * COMPUTE THIEF QUANTITY
                 ************************************************************/
                const { thief2, thief3 } = this.staticService.animalInfo.randomness

                const { value: computedQuantity } = this.thiefService.compute({
                    thief2,
                    thief3
                })

                const actualQuantity = Math.min(
                    computedQuantity,
                    placedItemAnimal.animalInfo.harvestQuantityRemaining
                )

                if (actualQuantity <= 0) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.ThiefAnimalProduct,
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
                    (placedItemType) => placedItemType.id === placedItemAnimal.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }
                const animal = this.staticService.animals.find(
                    (animal) => animal.id === placedItemType.animal.toString()
                )
                if (!animal) {
                    throw new GraphQLError("Animal not found", {
                        extensions: {
                            code: "ANIMAL_NOT_FOUND"
                        }
                    })
                }
                const product = this.staticService.products.find(
                    (product) =>
                        product.type === ProductType.Animal &&
                        product.animal.toString() === animal.id &&
                        product.isQuality === placedItemAnimal.animalInfo.isQuality
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
                    session: mongoSession
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
                        .create(createdInventories, { session: mongoSession })
                    const createdSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: createdInventoryRaws,
                        status: SchemaStatus.Created
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }   

                for (const inventory of updatedInventories) {
                    await inventory.save({ session: mongoSession })
                    const updatedSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: [inventory],
                        status: SchemaStatus.Created
                    })
                    syncedInventories.push(...updatedSyncedInventories)
                }

                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })

                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                await user.save({ session: mongoSession })

                /************************************************************
                 * UPDATE ANIMAL DATA
                 ************************************************************/
                placedItemAnimal.animalInfo.harvestQuantityRemaining -= actualQuantity
                placedItemAnimal.animalInfo.thieves.push(new Types.ObjectId(userId))
                await placedItemAnimal.save({ session: mongoSession })

                const syncedPlacedItem = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemAnimal],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...syncedPlacedItem)

                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.ThiefAnimalProduct,
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
                    messages: [{ value: JSON.stringify({ userId: neighborUserId, placedItems: syncedPlacedItems }) }]
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
