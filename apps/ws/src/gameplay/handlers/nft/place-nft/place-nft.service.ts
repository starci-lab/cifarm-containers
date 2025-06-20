import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema, UserSchema } from "@src/databases"
import { PlaceNFTMessage } from "./place-nft.dto"
import { UserLike } from "@src/jwt"
import { PositionService, StaticService, SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { DeepPartial, WithStatus } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { PlacedItemType } from "@src/databases"
import { ActionName, EmitActionPayload } from "../../../emitter"
@Injectable()
export class PlaceNFTService {
    private readonly logger = new Logger(PlaceNFTService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly staticService: StaticService,  
        private readonly positionService: PositionService
    ) {}

    async placeNFT(
        { id: userId }: UserLike,
        { placedItemId, position }: PlaceNFTMessage
    ): Promise<SyncedResponse> {
        // synced variables
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const mongoSession = await this.connection.startSession()
        let actionPayload: EmitActionPayload | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .session(session)
                if (!placedItem) {
                    throw new WsException("Placed item not found")
                }
                syncedPlacedItemAction = {
                    x: placedItem.x,
                    y: placedItem.y,
                    placedItemType: placedItem.placedItemType
                }
                if (placedItem.user.toString() !== userId) {
                    throw new WsException("You are not the owner of this placed item")
                }
                if (!placedItem.nftMetadata) {
                    throw new WsException("Placed item is not a NFT")
                }
                if (!placedItem.isStored) {
                    throw new WsException("Placed item is not stored")
                }
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.id === placedItem.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
                if (!user) {
                    throw new WsException("User not found")
                }
                // we require validation like buy fruit, tiles, pets, etc...
                switch (placedItemType.type) {
                case PlacedItemType.Fruit: {
                    const placedItemTypes = this.staticService.placedItemTypes.filter(
                        (placedItemType) => placedItemType.type === PlacedItemType.Fruit
                    )
                    const { fruitLimit } = this.staticService.landLimitInfo.landLimits.find(
                        (limit) => limit.index === user.landLimitIndex
                    )
                    const count = await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .countDocuments({
                            user: userId,
                            isStored: {
                                $ne: true
                            },
                            placedItemType: {
                                $in: placedItemTypes.map((placedItemType) => placedItemType.id)
                            }
                        })
                        .session(session)
                
                    if (count >= fruitLimit) {
                        throw new WsException("Max fruit limit reached")
                    }
                    break
                }
                case PlacedItemType.Tile: {
                    break
                }
                case PlacedItemType.Pet: {
                    break
                }
                }
                /************************************************************
                 * CHECK IF POSITION IS AVAILABLE
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    session,
                    userId,
                    itself: placedItem
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })

                // update placed item
                placedItem.isStored = false
                placedItem.x = position.x
                placedItem.y = position.y
                await placedItem.save({ session })
                const createdSyncedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItem]
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                return {
                    placedItems: syncedPlacedItems
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            actionPayload = {
                placedItem: syncedPlacedItemAction,
                action: ActionName.PlaceNFT,
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
