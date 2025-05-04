import { Injectable, Logger } from "@nestjs/common"
import { 
    FruitCurrentState,
    InjectMongoose, 
    InventorySchema, 
    InventoryKind,
    InventoryTypeId,
    PlacedItemSchema, 
    UserSchema
} from "@src/databases"
import { 
    EnergyService, 
    LevelService, 
    SyncService 
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { HelpUseBugNetMessage } from "./help-use-bug-net.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class HelpUseBugNetService {
    private readonly logger = new Logger(HelpUseBugNetService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUseBugNet(
        { id: userId }: UserLike,
        { placedItemFruitId }: HelpUseBugNetMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let watcherUserId: string | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * CHECK IF YOU HAVE BUG NET IN TOOLBAR
                 ************************************************************/
                const inventoryBugNetExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.BugNet),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                if (!inventoryBugNetExisted) {
                    throw new WsException("Bug net not found in toolbar")
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
                    throw new WsException("Cannot help your own fruit")
                }

                // Validate fruit has fruit info
                if (!placedItemFruit.fruitInfo) {
                    throw new WsException("Placed item is not a fruit")
                }

                // Validate fruit has bugs
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.IsBuggy) {
                    throw new WsException("Fruit does not buggy")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUseBugNet

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

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

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

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

                // Apply bug net to the fruit - reset to normal state
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                // Save placed item fruit
                await placedItemFruit.save({ session })

                // Add to synced placed items
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemFruitSnapshot,
                    placedItemUpdated: placedItemFruit
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionPayload = {
                    action: ActionName.HelpUseBugNet,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
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