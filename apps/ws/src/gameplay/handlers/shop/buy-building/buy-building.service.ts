import { Injectable, Logger } from "@nestjs/common"
import {
    BuildingKind,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService, SyncService, PositionService, LimitService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyBuildingMessage } from "./buy-building.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName, BuyBuildingData } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { StopBuyingResponse } from "../../types"

@Injectable()
export class BuyBuildingService {
    private readonly logger = new Logger(BuyBuildingService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService,
        private readonly limitService: LimitService
    ) {}

    async buyBuilding(
        { id: userId }: UserLike,
        { position, buildingId }: BuyBuildingMessage
    ): Promise<StopBuyingResponse<BuyBuildingData>> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload<BuyBuildingData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let stopBuying: boolean | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING
                 ************************************************************/
                // Fetch building details
                const building = this.staticService.buildings.find(
                    (building) => building.displayId === buildingId
                )
                if (!building) {
                    throw new WsException("Building not found")
                }

                if (!building.availableInShop) {
                    throw new WsException("Building not available in shop")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // save user snapshot
                const userSnapshot = user.$clone()

                /************************************************************
                 * FIND PLACED ITEM TYPE
                 ************************************************************/
                // Find the placed item type for this building
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Building &&
                        placedItemType.building &&
                        placedItemType.building.toString() === building.id.toString()
                )

                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                /************************************************************
                 * CHECK IF POSITION IS AVAILABLE
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    connection: this.connection,
                    userId
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })

                const placedItemBuildings = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        user: userId,
                        placedItemType: placedItemType.id
                    })
                    .session(session)

                if (placedItemBuildings.length >= building.maxOwnership) {
                    throw new WsException("Max building ownership reached")
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Calculate total cost
                const totalCost = building.price

                // Check if the user has enough gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: totalCost
                })

                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * PLACE BUILDING
                 ************************************************************/
                // Place the building
                let placedItemBuildingRaw: PlacedItemSchema

                // If the building is a bee house, we need to create a bee house info
                switch (building.kind) {
                case BuildingKind.BeeHouse: {
                    const [_placedItemBuildingRaw] = await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(
                            [
                                {
                                    user: userId,
                                    x: position.x,
                                    y: position.y,
                                    placedItemType: placedItemType.id,
                                    buildingInfo: {
                                        currentUpgrade: 1
                                    },
                                    beeHouseInfo: {}
                                }
                            ],
                            { session }
                        )
                    placedItemBuildingRaw = _placedItemBuildingRaw
                    break
                }
                case BuildingKind.Neutral: {
                    const [_placedItemBuildingRaw] = await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(
                            [
                                {
                                    user: userId,
                                    x: position.x,
                                    y: position.y,
                                    placedItemType: placedItemType.id,
                                    buildingInfo: {
                                        currentUpgrade: 1
                                    }
                                }
                            ],
                            { session }
                        )
                    placedItemBuildingRaw = _placedItemBuildingRaw
                    break
                }
                case BuildingKind.PetHouse: {
                    const [_placedItemBuildingRaw] = await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create(
                            [
                                {
                                    user: userId,
                                    x: position.x,
                                    y: position.y,
                                    placedItemType: placedItemType.id,
                                    buildingInfo: {
                                        currentUpgrade: 1
                                    }
                                }
                            ],
                            { session }
                        )
                    placedItemBuildingRaw = _placedItemBuildingRaw
                    break
                }
                }

                syncedPlacedItemAction = {
                    id: placedItemBuildingRaw._id.toString(),
                    x: placedItemBuildingRaw.x,
                    y: placedItemBuildingRaw.y,
                    placedItemType: placedItemBuildingRaw.placedItemType
                }

                const createdSyncedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItemBuildingRaw]
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare action message
                actionPayload = {
                    action: ActionName.BuyBuilding,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId,
                    data: {
                        buildingId: building.id
                    }
                }
                // Check if the user has reached the limit for this building
                const limitResult = await this.limitService.getBuildingLimit({
                    session,
                    userId,
                    building
                })
                stopBuying = !limitResult.placedItemCountNotExceedLimit
                || !limitResult.selectedPlacedItemCountNotExceedLimit
                || user.golds < building.price
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                action: actionPayload,
                stopBuying
            }
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
