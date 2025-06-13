import { Injectable, Logger } from "@nestjs/common"
import {
    AbstractPlantSchema,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    PlacedItemSchema,
    PlantCurrentState,
    PlantType,
    UserSchema
} from "@src/databases"
import { CoreService, EnergyService, LevelService, PlantInfoLike, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { InventoryService } from "@src/gameplay/inventory"
import { Connection } from "mongoose"
import { HarvestPlantMessage } from "./harvest-plant.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { HarvestPlantData } from "./types"

@Injectable()
export class HarvestPlantService {
    private readonly logger = new Logger(HarvestPlantService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly coreService: CoreService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService
    ) {}

    async harvestPlant(
        { id: userId }: UserLike,
        { placedItemTileId }: HarvestPlantMessage
    ): Promise<SyncedResponse<HarvestPlantData>> {
        this.logger.debug(`Harvesting plant for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<HarvestPlantData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                // check if crate is in toolbar
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
                 * RETRIEVE USER DATA
                 ************************************************************/
                // Fetch user
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
                 * RETRIEVE AND VALIDATE TILE DATA
                 ************************************************************/
                // Fetch placed item (tile)
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    throw new WsException("Tile not found")
                }

                if (placedItemTile.user.toString() !== userId) {
                    throw new WsException("Cannot harvest another user's tile")
                }

                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemTile.id,
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType
                }

                const placedItemTileSnapshot = placedItemTile.$clone()

                // Check if the tile has a plant
                if (!placedItemTile.plantInfo) {
                    throw new WsException("No plant found on this tile")
                }

                // Check if the plant is ready to harvest
                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.FullyMatured) {
                    throw new WsException("Plant is not ready to harvest")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume } = this.staticService.activities.harvestPlant
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * UPDATE USER ENERGY AND EXPERIENCE
                 ************************************************************/
                // Deduct energy
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                let plantInfo: PlantInfoLike
                let plant: AbstractPlantSchema

                switch (placedItemTile.plantInfo.plantType) {
                case PlantType.Crop: {
                    const crop = this.staticService.crops.find(
                        (crop) => crop.id === placedItemTile.plantInfo.crop?.toString()
                    )
                    if (!crop) {
                        throw new WsException("Crop information not found")
                    }
                    const cropInfo = this.staticService.cropInfo
                    plant = crop
                    plantInfo = cropInfo
                    break
                }
                case PlantType.Flower: {
                    const flower = this.staticService.flowers.find(
                        (flower) => flower.id === placedItemTile.plantInfo.flower?.toString()
                    )
                    if (!flower) {
                        throw new WsException("Flower information not found")
                    }
                    const flowerInfo = this.staticService.flowerInfo
                    plant = flower
                    plantInfo = flowerInfo
                    break
                }
                }

                // Add experience based on quality
                const experiencesGain = placedItemTile.plantInfo.isQuality
                    ? plant.qualityHarvestExperiences
                    : plant.basicHarvestExperiences

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
                 * PROCESS HARVEST AND UPDATE INVENTORY
                 ************************************************************/
                // Get harvest quantity
                const product = this.staticService.products.find((product) => {
                    switch (placedItemTile.plantInfo.plantType) {
                    case PlantType.Crop:
                        return product.crop?.toString() === plant.id
                    case PlantType.Flower:
                        return product.flower?.toString() === plant.id
                    }
                })

                if (!product) {
                    throw new WsException("Product not found")
                }

                const inventoryTypeProduct = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Product &&
                        inventoryType.product?.toString() === product.id
                )

                if (!inventoryTypeProduct) {
                    throw new WsException("Inventory type not found for this product")
                }

                // use inventory service to create inventory
                const { inventories, occupiedIndexes } = await this.inventoryService.getAddParams({
                    userId,
                    session,
                    inventoryType: inventoryTypeProduct,
                    kind: InventoryKind.Storage
                })

                const harvestQuantityRemaining = placedItemTile.plantInfo.harvestQuantityRemaining
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventories,
                    occupiedIndexes,
                    userId,
                    quantity: harvestQuantityRemaining,
                    inventoryType: inventoryTypeProduct,
                    kind: InventoryKind.Storage,
                    capacity: this.staticService.defaultInfo.storageCapacity
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

                for (const { inventorySnapshot, inventoryUpdated } of updatedInventories) {
                    // Update existing inventories
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
                this.coreService.updatePlacedItemTileAfterHarvest({
                    placedItemTile,
                    plant,
                    plantInfo
                })

                // Save placed item tile
                await placedItemTile.save({ session })

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
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.HarvestPlant,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId,
                    data: {
                        quantity: harvestQuantityRemaining,
                        productId: product.id
                    }
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    inventories: syncedInventories,
                    action: actionPayload
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
                actionPayload.success = false
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
