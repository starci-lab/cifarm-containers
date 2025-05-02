import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventorySchema,
    InventoryType,
    PlacedItemSchema,
    SupplyType,
    UserSchema
} from "@src/databases"
import {
    CoreService,
    EnergyService,
    InventoryService,
    LevelService,
    SyncService
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseFertilizerMessage } from "./use-fertilizer.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly coreService: CoreService
    ) {}

    async useFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemTileId }: UseFertilizerMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
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
                    .findOne({
                        _id: placedItemTileId,
                        user: userId
                    })
                    .session(session)

                if (!placedItemTile) {
                    throw new WsException("Tile not found")
                }

                // Check if the tile has a plant
                if (!placedItemTile.plantInfo) {
                    throw new WsException("No plant found on this tile")
                }

                // Check if the plant is already fertilized
                if (placedItemTile.plantInfo.isFertilized) {
                    throw new WsException("Plant is already fertilized")
                }
                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemTile.id,
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType,
                }
                const placedItemTileSnapshot = placedItemTile.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                 ************************************************************/
                // Fetch inventory supply (fertilizer)
                const inventorySupply = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)
                if (!inventorySupply) {
                    throw new WsException("Fertilizer not found in inventory")
                }
                // Check if the inventory supply is a fertilizer
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id === inventorySupply.inventoryType.toString()
                )
                if (!inventoryType) {
                    throw new WsException("Inventory type not found")
                }
                if (inventoryType.type !== InventoryType.Supply) {
                    throw new WsException("Not a supply")
                }
                const supplyFertilizer = this.staticService.supplies.find(
                    (supply) =>
                        supply.type === SupplyType.Fertilizer &&
                        supply.id === inventoryType.supply.toString()
                )
                if (!supplyFertilizer) {
                    throw new WsException("Supply fertilizer not found")
                }
                if (supplyFertilizer.type !== SupplyType.Fertilizer) {
                    throw new WsException("Not a fertilizer")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.useFertilizer
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
                 * UPDATE INVENTORY
                 ************************************************************/
                // Get parameters for removing inventory
                const { removedInventory, updatedInventory, removeInsteadOfUpdate } =
                    this.inventoryService.removeSingle({
                        inventory: inventorySupply,
                        quantity: 1
                    })

                if (removeInsteadOfUpdate) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany(
                        {
                            _id: { $in: removedInventory._id }
                        },
                        { session }
                    )
                    const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                        inventoryIds: [removedInventory.id]
                    })
                    syncedInventories.push(...deletedSyncedInventories)
                } else {
                    const { inventorySnapshot, inventoryUpdated } = updatedInventory
                    await inventoryUpdated.save({ session })
                    const syncedInventory = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot,
                        inventoryUpdated
                    })
                    syncedInventories.push(syncedInventory)
                }

                /************************************************************
                 * UPDATE PLACED ITEM TILE
                 ************************************************************/
                // Update tile with fertilizer information
                this.coreService.updatePlacedItemTileAfterUseFertilizer({
                    placedItemTile,
                    supply: supplyFertilizer
                })
                // Save placed item tile
                await placedItemTile.save({ session })

                const syncedUpdatedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemTileSnapshot,
                        placedItemUpdated: placedItemTile
                    }
                )
                syncedPlacedItems.push(syncedUpdatedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.UseFertilizer,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId
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
