import { Injectable, Logger } from "@nestjs/common"
import { 
    AnimalCurrentState,
    InjectMongoose, 
    InventoryKind, 
    InventorySchema, 
    InventoryTypeId, 
    PlacedItemSchema, 
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService, SyncService, InventoryService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseAnimalFeedMessage } from "./use-animal-feed.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseAnimalFeedService {
    private readonly logger = new Logger(UseAnimalFeedService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async useAnimalFeed(
        { id: userId }: UserLike,
        { placedItemAnimalId, inventorySupplyId }: UseAnimalFeedMessage
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
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/

                // Get placed item animal
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                // Validate animal exists
                if (!placedItemAnimal) {
                    throw new WsException("Animal not found")
                }

                // Validate ownership
                if (placedItemAnimal.user.toString() !== userId) {
                    throw new WsException("Cannot feed another user's animal")
                }

                // Validate animal is hungry
                if (placedItemAnimal.animalInfo?.currentState !== AnimalCurrentState.Hungry) {
                    throw new WsException("Animal is not hungry")
                }

                syncedPlacedItemAction = {
                    id: placedItemAnimalId,
                    placedItemType: placedItemAnimal.placedItemType,
                    x: placedItemAnimal.x,
                    y: placedItemAnimal.y
                }

                // snapshot placed item animal
                const placedItemAnimalSnapshot = placedItemAnimal.$clone()


                /************************************************************
                 * RETRIEVE AND VALIDATE ACTIVITY DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.useAnimalFeed
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                // Validate user exists
                if (!user) {
                    throw new WsException("User not found")
                }

                // snapshot user
                const userSnapshot = user.$clone()

                // Validate energy is sufficient
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                ************************************************************/

                // Get inventory data
                const inventorySupply = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)

                // Validate inventory exists
                if (!inventorySupply) {
                    throw new WsException("Inventory not found")
                }

                if (inventorySupply.kind !== InventoryKind.Tool) {
                    throw new WsException("Inventory is not a tool")
                }

                // Get inventory type
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id === inventorySupply.inventoryType.toString()
                )
                if (!inventoryType) {
                    throw new WsException("Inventory type not found")
                }

                // Validate inventory is animal feed
                if (inventoryType.displayId !== InventoryTypeId.AnimalFeed) {
                    throw new WsException("Inventory supply is not animal feed")
                }

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

                // Update user with energy and experience changes
                await user.save({ session })
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

                // Update animal state after feeding
                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({ session })
                const updatedSyncedPlacedItem = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemAnimalSnapshot,
                    placedItemUpdated: placedItemAnimal
                })
                syncedPlacedItems.push(updatedSyncedPlacedItem)

                // Prepare action message
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.UseAnimalFeed,
                    success: true,
                    userId
                }
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                inventories: syncedInventories,
                action: actionPayload
            }
        } catch (error) {
            this.logger.error(error)
            // Send failure action message if any error occurs
            if (actionPayload) {
                return {
                    action: actionPayload
                }
            }
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
} 