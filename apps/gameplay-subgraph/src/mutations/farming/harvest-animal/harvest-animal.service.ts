import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, DeepPartial, SchemaStatus, WithStatus } from "@src/common"
import {
    AnimalCurrentState,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    InventoryTypeSchema,
    PlacedItemSchema,
    ProductSchema,
    UserSchema
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    StaticService,
    CoreService,
    SyncService
} from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { HarvestAnimalRequest, HarvestAnimalResponse } from "./harvest-animal.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

interface HarvestAnimalData {
    productId: string
    quantity: number
}

@Injectable()
export class HarvestAnimalService {
    private readonly logger = new Logger(HarvestAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly coreService: CoreService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async harvestAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId }: HarvestAnimalRequest
    ): Promise<HarvestAnimalResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionMessage: EmitActionPayload<HarvestAnimalData> | undefined
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
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Get placed item animal
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                // Validate animal exists
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
                    y: placedItemAnimal.y,
                }

                // Validate animal is ready to harvest
                if (placedItemAnimal.animalInfo?.currentState !== AnimalCurrentState.Yield) {
                    throw new GraphQLError("Animal is not ready to collect product", {
                        extensions: {
                            code: "ANIMAL_NOT_READY"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.harvestAnimal

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
                
                const product = await this.connection
                    .model<ProductSchema>(ProductSchema.name)
                    .findOne({
                        isQuality: placedItemAnimal.animalInfo?.isQuality,
                        animal: animal.id
                    })
                    .session(session)

                // Validate product exists
                if (!product) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "PRODUCT_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/

                // Get inventory type for animal product
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        type: InventoryType.Product,
                        product: createObjectId(product?.displayId)
                    })
                    .session(session)

                // Validate inventory type exists
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE STORAGE CAPACITY
                 ************************************************************/

                // Get storage capacity setting
                const { storageCapacity } = this.staticService.defaultInfo

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

                // Get parameters for adding inventory
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                // Get harvest quantity
                const quantity = placedItemAnimal.animalInfo?.harvestQuantityRemaining || 0

                // Add the harvested product to inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity,
                    userId: user.id,
                    occupiedIndexes
                })

                if (createdInventories.length > 0) {
                    // Create new inventories
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                
                    const createdSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: createdInventoryRaws,
                        status: SchemaStatus.Created
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventories
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                    const updatedSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: [inventory],
                        status: SchemaStatus.Created
                    }) 
                    syncedInventories.push(...updatedSyncedInventories)
                }


                this.coreService.updatePlacedItemAnimalAfterHarvest({
                    placedItemAnimal,
                    animal,
                    animalInfo: this.staticService.animalInfo
                })

                await placedItemAnimal.save({ session })
                const syncedPlacedItem = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemAnimal],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...syncedPlacedItem)

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.HarvestAnimal,
                    success: true,
                    userId,
                    data: {
                        productId: product?.displayId,
                        quantity
                    }
                }

                return { quantity }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/

            // Send Kafka messages for success
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

            return result

            // No return value needed for void
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
