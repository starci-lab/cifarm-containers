import { Injectable, Logger } from "@nestjs/common"
import {
    BeeHouseCurrentState,
    BuildingKind,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    InventoryTypeId,
    PlacedItemSchema,
    ProductType,
    UserSchema
} from "@src/databases"
import { CoreService, EnergyService, LevelService, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { InventoryService } from "@src/gameplay/inventory"
import { Connection } from "mongoose"
import { HarvestBeeHouseMessage } from "./harvest-bee-house.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import {
    EmitActionPayload,
    ActionName,
    HarvestBeeHouseData
} from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class HarvestBeeHouseService {
    private readonly logger = new Logger(HarvestBeeHouseService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly coreService: CoreService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService
    ) {}

    async harvestBeeHouse(
        { id: userId }: UserLike,
        { placedItemBuildingId }: HarvestBeeHouseMessage
    ): Promise<SyncedResponse<HarvestBeeHouseData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<HarvestBeeHouseData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

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
                const placedItemBuilding = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemBuildingId)
                    .session(session)

                if (!placedItemBuilding) {
                    throw new WsException("Tile not found")
                }

                if (placedItemBuilding.user.toString() !== userId) {
                    throw new WsException("Cannot harvest another user's tile")
                }
                const placedItemBuildingSnapshot = placedItemBuilding.$clone()

                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.id === placedItemBuilding.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                const building = this.staticService.buildings.find(
                    (building) => building.id === placedItemType?.building?.toString()
                )
                if (!building) {
                    throw new WsException("Building not found")
                }
                if (building.kind !== BuildingKind.BeeHouse) {
                    throw new WsException("This is not a bee house")
                }
                // Check if the bee house is ready to harvest
                if (placedItemBuilding.beeHouseInfo.currentState !== BeeHouseCurrentState.Yield) {
                    throw new WsException("Bee house is not ready to harvest")
                }

                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemBuilding.id,
                    x: placedItemBuilding.x,
                    y: placedItemBuilding.y,
                    placedItemType: placedItemBuilding.placedItemType
                }

                //const placedItemBuildingSnapshot = placedItemBuilding.$clone()

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume } = this.staticService.activities.harvestBeeHouse
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

                // Add experience based on quality
                const experiencesGain = placedItemBuilding.beeHouseInfo.isQuality
                    ? building.beeHouseQualityHarvestExperiences
                    : building.beeHouseBasicHarvestExperiences

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
                // Find inventory type for this crop
                const product = this.staticService.products.find((product) => {
                    return product.type === ProductType.BeeHouse
                    && product.building?.toString() === building.id
                        && product.isQuality === placedItemBuilding.beeHouseInfo.isQuality
                })
                if (!product) {
                    throw new WsException("Product not found")
                }
                const inventoryTypeProduct = this.staticService.inventoryTypes.find((inventoryType) => {
                    return inventoryType.type === InventoryType.Product &&
                    inventoryType.product?.toString() === product.id
                })
                if (!inventoryTypeProduct) {
                    throw new WsException("Inventory type not found for bee house")
                }
                // use inventory service to create inventory
                const { inventories, occupiedIndexes } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    userId,
                    session,
                    inventoryType: inventoryTypeProduct,
                    kind: InventoryKind.Storage
                })
 
                const harvestQuantityRemaining = placedItemBuilding.beeHouseInfo.harvestQuantityRemaining
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
                this.coreService.updatePlacedItemBuildingBeeHouseAfterHarvest({
                    placedItemBuilding,
                })
                // Save placed item bee
                await placedItemBuilding.save({ session })

                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemBuildingSnapshot,
                        placedItemUpdated: placedItemBuilding
                    }
                )
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.HarvestBeeHouse,
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
