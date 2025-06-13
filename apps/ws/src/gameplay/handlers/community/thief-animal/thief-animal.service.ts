import { Injectable, Logger } from "@nestjs/common"
import { 
    AnimalCurrentState,
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
    AssistanceService
} from "@src/gameplay"
import { ThiefService } from "@src/gameplay/thief"
import { StaticService } from "@src/gameplay/static"
import { Connection, Types } from "mongoose"
import { ThiefAnimalMessage } from "./thief-animal.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { ThiefAnimalData, ThiefAnimalReasonCode } from "./types"

@Injectable()
export class ThiefAnimalService {
    private readonly logger = new Logger(ThiefAnimalService.name)

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

    async thiefAnimal(
        { id: userId }: UserLike,
        { placedItemAnimalId }: ThiefAnimalMessage
    ): Promise<SyncedResponse<ThiefAnimalData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<ThiefAnimalData> | undefined
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
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Fetch placed item animal
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) {
                    throw new WsException("Animal not found")
                }

                // return error if you already thief animal
                if (placedItemAnimal.animalInfo.thieves.map((thief) => thief.toString()).includes(userId)) {
                    throw new WsException("You have already stolen this animal")
                }

                // if the quantity is not enough to harvest
                if (
                    placedItemAnimal.animalInfo.harvestQuantityRemaining 
                    <= placedItemAnimal.animalInfo.harvestQuantityMin
                ) {
                    actionPayload = {
                        action: ActionName.ThiefAnimal,
                        placedItem: syncedPlacedItemAction,
                        success: false,
                        reasonCode: ThiefAnimalReasonCode.QuantityReactMinimum,
                        userId
                    }
                    throw new WsException("Animal is not enough to harvest")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemAnimal.id,
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y,
                    placedItemType: placedItemAnimal.placedItemType
                }

                const placedItemAnimalSnapshot = placedItemAnimal.$clone()

                // Validate user doesn't own the animal
                watcherUserId = placedItemAnimal.user.toString()
                if (watcherUserId === userId) {
                    throw new WsException("Cannot steal your own animal")
                }

                // Get placed item type info
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.id === placedItemAnimal.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Invalid placed item type")
                }

                // Validate placed item type is animal
                if (placedItemType.type !== PlacedItemType.Animal) {
                    throw new WsException("Placed item is not an animal")
                }

                // Validate animal has animal info
                if (!placedItemAnimal.animalInfo) {
                    throw new WsException("Animal info not found")
                }

                // Validate animal is yielding
                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
                    actionPayload = {
                        action: ActionName.ThiefAnimal,
                        placedItem: syncedPlacedItemAction,
                        success: false,
                        reasonCode: ThiefAnimalReasonCode.NotReadyToHarvest,
                        userId
                    }
                    throw new WsException("Animal is not ready to harvest")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.thiefAnimal

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * RETRIEVE PRODUCT DATA
                 ************************************************************/
                // Get animal from static data
                const animal = this.staticService.animals.find(
                    (animal) => animal.id === placedItemType.animal?.toString()
                )
                if (!animal) {
                    throw new WsException("Animal not found")
                }

                // Get product data
                const product = this.staticService.products.find(
                    (product) => product.animal?.toString() === animal.id
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
                        action: ActionName.ThiefAnimal,
                        placedItem: syncedPlacedItemAction,
                        success: false,
                        reasonCode: ThiefAnimalReasonCode.DogAssisted,
                        userId
                    }
                    const placedItemAnimalSnapshot = placedItemAnimal.$clone()
                    placedItemAnimal.animalInfo.thieves.push(new Types.ObjectId(userId))
                    await placedItemAnimal.save({ session })
                    const updatedSyncedPlacedItems =
                        this.syncService.getPartialUpdatedSyncedPlacedItem({
                            placedItemSnapshot: placedItemAnimalSnapshot,
                            placedItemUpdated: placedItemAnimal
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
                const { value } = this.thiefService.computeAnimal()
                const desiredQuantity = value
                let actualQuantity = Math.min(
                    desiredQuantity,
                    placedItemAnimal.animalInfo.harvestQuantityRemaining - placedItemAnimal.animalInfo.harvestQuantityMin
                )
                if (catAssistedSuccess) {
                    actualQuantity += plusQuantityAfterComputed
                    actualQuantity = Math.floor(actualQuantity * (1 + percentQuantityBonusAfterComputed)) 
                }

                // Get inventory add parameters
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
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
                 * UPDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Reduce the harvest quantity of the animal by the quantity stolen
                placedItemAnimal.animalInfo.harvestQuantityRemaining =
                    placedItemAnimal.animalInfo.harvestQuantityRemaining - actualQuantity
                placedItemAnimal.animalInfo.thieves.push(new Types.ObjectId(userId))

                // Save placed item animal
                await placedItemAnimal.save({ session })

                // Add to synced placed items
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemAnimalSnapshot,
                        placedItemUpdated: placedItemAnimal
                    }
                )
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionPayload = {
                    action: ActionName.ThiefAnimal,
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