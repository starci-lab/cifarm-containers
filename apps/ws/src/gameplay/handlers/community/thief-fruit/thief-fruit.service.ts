import { Injectable, Logger } from "@nestjs/common"
import { 
    FruitCurrentState,
    InjectMongoose, 
    InventorySchema, 
    InventoryKind,
    InventoryTypeId,
    InventoryType,
    PlacedItemSchema, 
    PlacedItemType,
    UserSchema
} from "@src/databases"
import { 
    EnergyService, 
    InventoryService,   
    LevelService, 
    SyncService,
    ThiefService,
    AssistanceService
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection, Types } from "mongoose"
import { ThiefFruitMessage } from "./thief-fruit.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName, ThiefFruitData, ThiefFruitReasonCode } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class ThiefFruitService {
    private readonly logger = new Logger(ThiefFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly thiefService: ThiefService,
        private readonly assistanceService: AssistanceService
    ) {}

    async thiefFruit(
        { id: userId }: UserLike,
        { placedItemFruitId }: ThiefFruitMessage
    ): Promise<SyncedResponse<ThiefFruitData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<ThiefFruitData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        let watcherUserId: string | undefined

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
                    .session(session)

                if (!inventoryCrateExisted) {
                    throw new WsException("Crate not found in toolbar")
                }
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM FRUIT
                 ************************************************************/
                // Fetch placed item fruit
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)

                if (!placedItemFruit) {
                    throw new WsException("Fruit not found")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemFruit.id,
                    x: placedItemFruit.x,
                    y: placedItemFruit.y,
                    placedItemType: placedItemFruit.placedItemType
                }

                const placedItemFruitSnapshot = placedItemFruit.$clone()

                // Validate user doesn't own the fruit
                watcherUserId = placedItemFruit.user.toString()
                if (watcherUserId === userId) {
                    throw new WsException("Cannot steal your own fruit")
                }

                // Get placed item type info
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.id === placedItemFruit.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Invalid placed item type")
                }

                // Validate placed item type is fruit
                if (placedItemType.type !== PlacedItemType.Fruit) {
                    throw new WsException("Placed item is not a fruit")
                }

                // Validate fruit has fruit info
                if (!placedItemFruit.fruitInfo) {
                    throw new WsException("Fruit info not found")
                }

                // Validate fruit is ready to harvest
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.FullyMatured) {
                    throw new WsException("Fruit is not ready to harvest")
                }

                // return error if you already thief fruit
                if (placedItemFruit.fruitInfo.thieves.map((thief) => thief.toString()).includes(userId)) {
                    throw new WsException("You have already stolen this fruit")
                }   

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.thiefFruit

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // Check thief level gap
                const neighbor = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(watcherUserId)
                    .session(session)
                if (!neighbor) {
                    throw new WsException("Neighbor not found")
                }

                if (neighbor.network !== user.network) {
                    throw new WsException("Cannot help neighbor in different network")
                }

                this.thiefService.checkLevelGap({
                    user,
                    neighbor
                })

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * RETRIEVE PRODUCT DATA
                 ************************************************************/
                // Get fruit from static data
                const fruit = this.staticService.fruits.find(
                    (fruit) => fruit.id === placedItemType.fruit?.toString()
                )
                if (!fruit) {
                    throw new WsException("Fruit not found")
                }

                // Get product data
                const product = this.staticService.products.find(
                    (product) => product.fruit?.toString() === fruit.id
                )
                if (!product) {
                    throw new WsException("Product not found")
                }

                /************************************************************
                 * RETRIEVE INVENTORY TYPE FOR PRODUCT
                 ************************************************************/
                // Get inventory type for product
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Product &&
                        inventoryType.product?.toString() === product.id
                )
                if (!inventoryType) {
                    throw new WsException("Inventory type not found")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * VALIDATE STORAGE CAPACITY
                 ************************************************************/
                // Get storage capacity from static data
                const { storageCapacity } = this.staticService.defaultInfo

                // check assist strength
                const {
                    success: dogAssistedSuccess,
                } = await this.assistanceService.dogDefenseSuccess({
                    neighborUser: neighbor,
                    user,
                    session
                })
                if (dogAssistedSuccess) {
                    actionPayload = {
                        action: ActionName.ThiefFruit,
                        placedItem: syncedPlacedItemAction,
                        success: false,
                        reasonCode: ThiefFruitReasonCode.DogAssisted,
                        userId
                    }
                    const placedItemFruitSnapshot = placedItemFruit.$clone()
                    placedItemFruit.fruitInfo.thieves.push(new Types.ObjectId(userId))
                    await placedItemFruit.save({ session })
                    const updatedSyncedPlacedItems =
                        this.syncService.getPartialUpdatedSyncedPlacedItem({
                            placedItemSnapshot: placedItemFruitSnapshot,
                            placedItemUpdated: placedItemFruit
                        })
                    syncedPlacedItems.push(updatedSyncedPlacedItems)
                    syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                        userSnapshot,
                        userUpdated: user
                    })
                    await user.save({ session })
                    await neighbor.save({ session })    
                    return {
                        user: syncedUser,
                        placedItems: syncedPlacedItems,
                        action: actionPayload,
                        watcherUserId
                    }
                }
                const {
                    success: catAssistedSuccess,
                    placedItemCatUpdated,
                    percentQuantityBonusAfterComputed,
                    plusQuantityAfterComputed
                } = await this.assistanceService.catAttackSuccess({
                    user,
                    session
                })
                if (catAssistedSuccess) {
                    await placedItemCatUpdated.save({ session })
                }

                /************************************************************
                 * DATA MODIFICATION
                 ************************************************************/
                // Deduct energy
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                // Add experience
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Save user
                await user.save({ session })

                // Add to synced user
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * ADD HARVESTED PRODUCT TO INVENTORY
                 ************************************************************/
                // Amount of product to steal
                const { value } = this.thiefService.computeFruit()
                const desiredQuantity = value
                let actualQuantity = Math.min(
                    desiredQuantity,
                    placedItemFruit.fruitInfo.harvestQuantityRemaining - placedItemFruit.fruitInfo.harvestQuantityMin
                )
                if (catAssistedSuccess) {
                    actualQuantity += plusQuantityAfterComputed
                    actualQuantity = Math.floor(actualQuantity * (1 + percentQuantityBonusAfterComputed)) 
                }

                // Get inventory add parameters
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session
                })

                // Add the stolen product to inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    quantity: actualQuantity,
                    userId,
                    occupiedIndexes
                })

                if (createdInventories.length > 0) {
                    // Create new inventories
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })

                    const createdSyncedInventories = this.syncService.getCreatedSyncedInventories({
                        inventories: createdInventoryRaws
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventories
                for (const { inventorySnapshot, inventoryUpdated } of updatedInventories) {
                    await inventoryUpdated.save({ session })
                    const updatedSyncedInventory =
                        this.syncService.getPartialUpdatedSyncedInventory({
                            inventorySnapshot,
                            inventoryUpdated
                        })
                    syncedInventories.push(updatedSyncedInventory)
                }

                /************************************************************
                 * UPDATE PLACED ITEM FRUIT
                 ************************************************************/
                // Reduce the harvest quantity of the fruit by the quantity stolen
                placedItemFruit.fruitInfo.harvestQuantityRemaining =
                    placedItemFruit.fruitInfo.harvestQuantityRemaining - actualQuantity

                // Add thief to fruit info
                placedItemFruit.fruitInfo.thieves.push(new Types.ObjectId(userId))

                // Save placed item fruit
                await placedItemFruit.save({ session })

                // Add to synced placed items
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemFruitSnapshot,
                        placedItemUpdated: placedItemFruit
                    }
                )
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionPayload = {
                    action: ActionName.ThiefFruit,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId,
                    data: {
                        quantity: actualQuantity,
                        productId: product.id,
                        catAssistedSuccess
                    }
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    inventories: syncedInventories,
                    action: actionPayload,
                    watcherUserId
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
                return {
                    action: actionPayload
                }
            }

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
} 