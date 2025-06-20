import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventorySchema,
    PlacedItemSchema,
    PlantType,
    UserSchema,
    PlantInfoSchema,    
    AbstractPlantSchema,
    InventoryKind
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { PlantSeedMessage } from "./plant-seed.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async plantSeed(
        { id: userId }: UserLike,
        { inventorySeedId, placedItemTileId }: PlantSeedMessage
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
                const placedItemTileSnapshot = placedItemTile.$clone()
                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemTile.id,
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType,
                }

                // Check if the tile already has a plant
                if (placedItemTile.plantInfo) {
                    throw new WsException("Tile already has a plant")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SEED
                 ************************************************************/
                // Fetch inventory seed
                const inventorySeed = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        _id: inventorySeedId,
                        user: userId,
                    })
                    .session(session)

                if (!inventorySeed) {
                    throw new WsException("Seed not found in inventory")
                }

                if (inventorySeed.kind !== InventoryKind.Tool) {
                    throw new WsException("Seed is not in toolbar")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume, experiencesGain } = this.staticService.activities.plantSeed
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * UPDATE USER ENERGY
                 ************************************************************/
                // Deduct energy
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                // Increase experience
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
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.id.toString() === inventorySeed.inventoryType.toString()
                )
                const { removedInventory, updatedInventory, removeInsteadOfUpdate } = this.inventoryService.removeSingle({
                    inventory: inventorySeed,
                    quantity: 1
                })

                if (removeInsteadOfUpdate) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                        _id: { $in: removedInventory._id }
                    }).session(session)
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
                // Update tile with plant info
                let plant: AbstractPlantSchema
                let plantType: PlantType
                switch (inventoryType.seedType) {
                case PlantType.Crop: {
                    plant = this.staticService.crops.find(
                        (crop) => crop.id.toString() === inventoryType.crop.toString()
                    )
                    plantType = PlantType.Crop
                    break
                }
                case PlantType.Flower: {
                    plant = this.staticService.flowers.find(
                        (flower) => flower.id.toString() === inventoryType.flower.toString()
                    )
                    plantType = PlantType.Flower
                    break
                }
                }

                // use as to avoid type error
                const plantInfo: DeepPartial<PlantInfoSchema> = {
                    plantType,
                    crop: plantType === PlantType.Crop ? plant.id : undefined,
                    flower: plantType === PlantType.Flower ? plant.id : undefined
                }
                placedItemTile.plantInfo = plantInfo as PlantInfoSchema
                // Save placed item tile
                const savedPlacedItemTile = await placedItemTile.save({ session })
                const syncedUpdatedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemTileSnapshot,
                        placedItemUpdated: savedPlacedItemTile
                    }
                )
                syncedPlacedItems.push(syncedUpdatedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.PlantSeed,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId,
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
            const actionPayload = {
                placedItem: syncedPlacedItemAction,
                action: ActionName.PlantSeed,
                success: false,
                error: error.message,
                userId
            }
            return {
                action: actionPayload
            }
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
