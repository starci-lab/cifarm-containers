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
import { EnergyService, LevelService, SyncService, ThiefService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { InventoryService } from "@src/gameplay/inventory"
import { Connection, Types } from "mongoose"
import { ThiefBeeHouseMessage } from "./thief-bee-house.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import {
    EmitActionPayload,
    ActionName,
    ThiefBeeHouseData
} from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class ThiefBeeHouseService {
    private readonly logger = new Logger(ThiefBeeHouseService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {}

    async thiefBeeHouse(
        { id: userId }: UserLike,
        { placedItemBuildingId }: ThiefBeeHouseMessage
    ): Promise<SyncedResponse<ThiefBeeHouseData>> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload<ThiefBeeHouseData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        let watcherUserId: string | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
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

                // Validate user doesn't own the animal
                watcherUserId = placedItemBuilding.user.toString()
                if (watcherUserId === userId) {
                    throw new WsException("Cannot steal your own bee house")
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
                const { experiencesGain, energyConsume } = this.staticService.activities.thiefBeeHouse
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

                // Add experience for the activity
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
                const animalInfo = this.staticService.beeHouseInfo
                
                const { value } = this.thiefService.compute({
                    thief2: animalInfo.randomness.thief2,
                    thief3: animalInfo.randomness.thief3
                })
                const desiredQuantity = value
                const actualQuantity = Math.min(
                    desiredQuantity,
                    placedItemBuilding.beeHouseInfo.harvestQuantityRemaining - placedItemBuilding.beeHouseInfo.harvestQuantityMin
                )

                // Get inventory add parameters
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType: inventoryTypeProduct,
                    userId,
                    session
                })
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventories,
                    occupiedIndexes,
                    userId,
                    quantity: actualQuantity,
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
                placedItemBuilding.beeHouseInfo.harvestQuantityRemaining -= actualQuantity
                placedItemBuilding.beeHouseInfo.thieves.push(new Types.ObjectId(userId))
                
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
                    action: ActionName.ThiefBeeHouse,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId,
                    data: {
                        quantity: actualQuantity,
                        productId: product.id
                    }
                }
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                inventories: syncedInventories,
                action: actionPayload,
                watcherUserId
            }
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
