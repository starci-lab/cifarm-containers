import { Injectable, Logger } from "@nestjs/common"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UpgradeBuildingMessage } from "./upgrade-building.dto"
import { PlacedItemSchema, UserSchema, InjectMongoose } from "@src/databases"
import { UserLike } from "@src/jwt"
import { ActionName, EmitActionPayload } from "../../../emitter"
import { DeepPartial } from "@src/common"
import { WithStatus } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncService } from "@src/gameplay"
import { SyncedResponse } from "../../types"

@Injectable()
export class UpgradeBuildingService {
    private readonly logger = new Logger(UpgradeBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async upgradeBuilding(
        { id: userId }: UserLike,
        { placedItemBuildingId }: UpgradeBuildingMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []

        try {
            const result = await mongoSession.withTransaction(async () => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItemBuilding = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemBuildingId)
                    .session(mongoSession)

                if (!placedItemBuilding) {
                    throw new WsException("Placed item not found")
                }

                const placedItemBuildingSnapshot = placedItemBuilding.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING TYPE
                 ************************************************************/
                const building = this.staticService.buildings.find(
                    (building) => building.id === placedItemBuilding.placedItemType.toString()
                )   
                if (!building) {
                    throw new WsException("Building type not found in static data")
                }

                /************************************************************
                 * CHECK UPGRADE AVAILABILITY
                 ************************************************************/
                const currentUpgradeLevel = placedItemBuilding.buildingInfo.currentUpgrade

                if (currentUpgradeLevel >= building.maxUpgrade) {
                    throw new WsException("Building already at max upgrade level")
                }

                const nextUpgrade = building.upgrades.find(
                    (upgrade) => upgrade.upgradeLevel === currentUpgradeLevel + 1
                )

                if (!nextUpgrade) {
                    throw new WsException("Next upgrade not found")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)
                    
                if (!user) {
                    throw new WsException("User not found")
                }
                const userSnapshot = user.$clone()
                /************************************************************
                 * CHECK SUFFICIENT GOLD
                 ************************************************************/
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: nextUpgrade.upgradePrice
                })

                /************************************************************
                 * UPDATE USER GOLD
                 ************************************************************/
                this.goldBalanceService.subtract({
                    user: user,
                    amount: nextUpgrade.upgradePrice
                })

                await user.save({ session: mongoSession })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
                /************************************************************
                 * UPDATE BUILDING UPGRADE LEVEL
                 ************************************************************/
                placedItemBuilding.buildingInfo.currentUpgrade = currentUpgradeLevel + 1
                await placedItemBuilding.save({ session: mongoSession })
                const updatedSyncedPlacedItem = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemBuildingSnapshot,
                    placedItemUpdated: placedItemBuilding
                })
                syncedPlacedItems.push(updatedSyncedPlacedItem)

                // we thus emit the new synced placed item action
                syncedPlacedItemAction = {
                    //id: placedItemBuilding.id,
                    x: placedItemBuilding.x,
                    y: placedItemBuilding.y,
                    buildingInfo: {
                        currentUpgrade: placedItemBuilding.buildingInfo.currentUpgrade
                    },
                    placedItemType: placedItemBuilding.placedItemType
                }

                actionPayload = {
                    action: ActionName.UpgradeBuilding,
                    userId,
                    placedItem: syncedPlacedItemAction,
                    success: true,
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
            const actionPayload = {
                placedItem: syncedPlacedItemAction,
                action: ActionName.UpgradeBuilding,
                success: false,
                error: error.message,
                userId
            }
            return {
                action: actionPayload
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
