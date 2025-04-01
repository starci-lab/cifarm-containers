import { Injectable, Logger } from "@nestjs/common"
import { 
    FruitCurrentState,
    InjectMongoose, 
    InventorySchema, 
    InventoryType, 
    InventoryTypeId, 
    PlacedItemSchema, 
    UserSchema 
} from "@src/databases"
import { 
    EnergyService, 
    InventoryService, 
    LevelService, 
    SyncService 
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseFruitFertilizerMessage } from "./use-fruit-fertilizer.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseFruitFertilizerService {
    private readonly logger = new Logger(UseFruitFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async useFruitFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemFruitId }: UseFruitFertilizerMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                 ************************************************************/

                // Get inventory supply
                const inventorySupply = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                // Validate inventory exists
                if (!inventorySupply) {
                    throw new WsException("Inventory not found")
                }

                // Get inventory type
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id === inventorySupply.inventoryType.toString()
                )

                // Validate inventory type exists and is a supply
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new WsException("Inventory type is not supply")
                }

                // Validate inventory type is fruit fertilizer
                if (inventoryType.displayId !== InventoryTypeId.FruitFertilizer) {
                    throw new WsException("Inventory supply is not Fruit Fertilizer")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM FRUIT
                 ************************************************************/

                // Get placed item fruit
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(session)

                // Validate placed item fruit exists
                if (!placedItemFruit) {
                    throw new WsException("Placed item fruit not found")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemFruitId,
                    placedItemType: placedItemFruit.placedItemType,
                    x: placedItemFruit.x,
                    y: placedItemFruit.y
                }

                // Validate ownership
                if (placedItemFruit.user.toString() !== userId) {
                    throw new WsException("Cannot use fruit fertilizer on other's tile")
                }

                // Validate tile has fruit tree
                if (!placedItemFruit.fruitInfo) {
                    throw new WsException("Tile has no fruit tree")
                }

                // Validate tile needs fertilizer
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.NeedFertilizer) {
                    throw new WsException("Tile does not need fertilizer")
                }

                // Save a copy of the placed item for syncing
                const placedItemFruitSnapshot = placedItemFruit.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.useFruitFertilizer

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                // Validate user exists
                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                // Validate energy is sufficient
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/

                // Update user energy and experience
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

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
                
                // Get parameters for removing inventory
                const { removedInventory, updatedInventory, removeInsteadOfUpdate } = this.inventoryService.removeSingle({
                    inventory: inventorySupply,
                    quantity: 1
                })

                if (removeInsteadOfUpdate) {
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                        _id: { $in: removedInventory._id }
                    }, { session })
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

                // Update placed item tile
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                
                // Save changes
                await placedItemFruit.save({ session })
                
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemFruitSnapshot,
                    placedItemUpdated: placedItemFruit
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                // Prepare action message
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.UseFruitFertilizer,
                    success: true,
                    userId
                }
            })
            return {
                action: actionPayload,
                user: syncedUser,
                placedItems: syncedPlacedItems,
                inventories: syncedInventories
            }
        } catch (error) {
            this.logger.error(error)
            if (actionPayload) {
                return {
                    action: actionPayload
                }
            }
            throw new WsException("Error using fruit fertilizer")
        } finally {
            await mongoSession.endSession()
        }
    }
}
    