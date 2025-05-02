import { Injectable, Logger } from "@nestjs/common"
import {
    PlantCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryKind,
    InventoryTypeId,
    InventoryType,
    PlacedItemSchema,
    PlacedItemType,
    UserSchema,
    PlantType,
    AbstractPlantSchema
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
import { ThiefPlantMessage } from "./thief-plant.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName, ThiefPlantData, ThiefPlantReasonCode } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class ThiefPlantService {
    private readonly logger = new Logger(ThiefPlantService.name)

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

    async thiefPlant(
        { id: userId }: UserLike,
        { placedItemTileId }: ThiefPlantMessage
    ): Promise<SyncedResponse<ThiefPlantData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<ThiefPlantData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        let watcherUserId: string | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
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
                // Fetch placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    throw new WsException("Tile not found")
                }

                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.id === placedItemTile.placedItemType.toString()
                )

                if (!placedItemType) {
                    throw new WsException("Invalid placed item type")
                }

                if (placedItemType.type !== PlacedItemType.Tile) {
                    throw new WsException("Placed item is not a tile")
                }

                if (!placedItemTile.plantInfo) {
                    throw new WsException("Tile is not planted")
                }

                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.FullyMatured) {
                    throw new WsException("Plant is not fully mature")
                }

                if (
                    placedItemTile.plantInfo.thieves
                        .map((thief) => thief.toString())
                        .includes(userId)
                ) {
                    throw new WsException("You have already stolen this plant")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemTile.id,
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType
                }

                const placedItemTileSnapshot = placedItemTile.$clone()

                // Validate user doesn't own the tile
                watcherUserId = placedItemTile.user.toString()
                if (watcherUserId === userId) {
                    throw new WsException("Cannot steal your own plant")
                }
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.thiefPlant

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
                this.thiefService.checkAbleToThief({
                    user,
                    neighbor
                })

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()
                // Get product from static data based on plant
                let plant: AbstractPlantSchema | undefined
                let desiredQuantity: number

                switch (placedItemTile.plantInfo.plantType) {
                case PlantType.Crop: {
                    plant = this.staticService.crops.find(
                        (crop) => crop.id === placedItemTile.plantInfo.crop.toString()
                    )
                    const { value } = this.thiefService.computeCrop()
                    desiredQuantity = value
                    break
                }
                case PlantType.Flower: {
                    plant = this.staticService.flowers.find(
                        (flower) => flower.id === placedItemTile.plantInfo.flower.toString()
                    )
                    const { value } = this.thiefService.computeFlower()
                    desiredQuantity = value
                    break
                }
                }

                // Get product data
                const product = this.staticService.products.find((product) => {
                    switch (placedItemTile.plantInfo.plantType) {
                    case PlantType.Crop: {
                        return product.crop?.toString() === plant.id
                    }
                    case PlantType.Flower: {
                        return product.flower?.toString() === plant.id
                    }
                    }
                })
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
                        action: ActionName.ThiefPlant,
                        placedItem: syncedPlacedItemAction,
                        success: false,
                        reasonCode: ThiefPlantReasonCode.DogAssisted,
                        userId
                    }
                    const placedItemTileSnapshot = placedItemTile.$clone()
                    placedItemTile.plantInfo.thieves.push(new Types.ObjectId(userId))
                    await placedItemTile.save({ session })
                    const updatedSyncedPlacedItems =
                        this.syncService.getPartialUpdatedSyncedPlacedItem({
                            placedItemSnapshot: placedItemTileSnapshot,
                            placedItemUpdated: placedItemTile
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
                let actualQuantity = Math.min(
                    desiredQuantity,
                    placedItemTile.plantInfo.harvestQuantityRemaining -
                        placedItemTile.plantInfo.harvestQuantityMin
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
                 * UPDATE PLACED ITEM TILE
                 ************************************************************/
                // Reduce the harvest quantity of the plant by the quantity stolen
                placedItemTile.plantInfo.harvestQuantityRemaining =
                    placedItemTile.plantInfo.harvestQuantityRemaining - actualQuantity
                // Add thief to plant info
                placedItemTile.plantInfo.thieves.push(new Types.ObjectId(userId))
                // Save placed item tile
                await placedItemTile.save({ session })

                // Add to synced placed items
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemTileSnapshot,
                        placedItemUpdated: placedItemTile
                    }
                )
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionPayload = {
                    action: ActionName.ThiefPlant,
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
