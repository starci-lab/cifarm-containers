import { Injectable, Logger } from "@nestjs/common"
import { 
    FruitCurrentState,
    InjectMongoose, 
    InventoryKind, 
    InventorySchema, 
    InventoryTypeId, 
    PlacedItemSchema, 
    UserSchema 
} from "@src/databases"
import { 
    CoreService,
    EnergyService, 
    LevelService, 
    SyncService 
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseBugNetMessage } from "./use-bug-net.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseBugNetService {
    private readonly logger = new Logger(UseBugNetService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly coreService: CoreService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async useBugNet(
        { id: userId }: UserLike,
        { placedItemFruitId }: UseBugNetMessage
    ): Promise<SyncedResponse> {
        this.logger.debug(`Using bug net for user ${userId}, fruit ID: ${placedItemFruitId}`)

        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE BUG NET TOOL
                 ************************************************************/

                // Get bug net inventory
                const inventoryBugNetExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.BugNet),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                // Validate user has bug net
                if (!inventoryBugNetExisted) {
                    throw new WsException("Bug net not found in toolbar")
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
                    throw new WsException("Fruit not found")
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
                    throw new WsException("Cannot use bug net on other's tile")
                }

                // Validate fruit is planted
                if (!placedItemFruit.fruitInfo) {
                    throw new WsException("Fruit is not planted")
                }

                // Validate fruit is infested
                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.IsBuggy) {
                    throw new WsException("Fruit is not infested")
                }

                // Save a copy of the placed item for syncing
                const placedItemFruitSnapshot = placedItemFruit.$clone()

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

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE ACTIVITY DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.useBugNet

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

                // Update fruit state
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal

                // Save changes
                await placedItemFruit.save({ session })
                
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemFruitSnapshot,
                    placedItemUpdated: placedItemFruit
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                // Save user
                await user.save({ session })
                
                // Add to synced user
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                // Prepare action message
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.UseBugNet,
                    success: true,
                    userId
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
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