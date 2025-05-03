import { ActionName, EmitActionPayload } from "../../../emitter"
import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema, PlacedItemType, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService, SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { SellMessage } from "./sell.dto"
import { UserLike } from "@src/jwt"
import { SyncedResponse } from "../../types"
import { DeepPartial, WithStatus } from "@src/common"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class SellService {
    private readonly logger = new Logger(SellService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async sell({ id: userId }: UserLike, { placedItemId }: SellMessage): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .session(session)

                if (!placedItem) {
                    throw new WsException("Placed item not found")
                }
                
                syncedPlacedItemAction = {
                    id: placedItem.id,
                    x: placedItem.x,
                    y: placedItem.y,
                    placedItemType: placedItem.placedItemType
                }
                /************************************************************
                 * VALIDATE OWNERSHIP
                 ************************************************************/
                if (placedItem.user.toString() !== userId) {
                    throw new WsException("You do not own this placed item")
                }
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TYPE
                 ************************************************************/
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.id === placedItem.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                /************************************************************
                 * DETERMINE SELL PRICE BASED ON ITEM TYPE
                 ************************************************************/
                let sellPrice: number
                switch (placedItemType.type) {
                case PlacedItemType.Building: {
                    const building = this.staticService.buildings.find(
                        (building) => building.id === placedItemType.building.toString()
                    )
                    if (!building) {
                        throw new WsException("Building not found")
                    }
                    if (!building.sellable) {
                        throw new WsException("Building not sellable")
                    }
                    if (!building.sellPrice) {
                        throw new WsException("Building sell price not found")
                    }
                    sellPrice = building.sellPrice
                    break
                }
                case PlacedItemType.Tile: {
                    const tile = this.staticService.tiles.find(
                        (tile) => tile.id === placedItemType.tile.toString()
                    )
                    if (!tile) {
                        throw new WsException("Tile not found")
                    }   
                    if (!tile.sellable) {
                        throw new WsException("Tile not sellable")
                    }
                    if (!tile.sellPrice) {
                        throw new WsException("Tile sell price not found")
                    }
                    sellPrice = tile.sellPrice
                    break
                }
                case PlacedItemType.Animal: {
                    const animal = this.staticService.animals.find(
                        (animal) => animal.id === placedItemType.animal.toString()
                    )
                    if (!animal) {
                        throw new WsException("Animal not found")
                    }
                    if (!animal.sellable) {
                        throw new WsException("Animal not sellable")
                    }
                    if (!animal.sellPrice) {
                        throw new WsException("Animal sell price not found")
                    }
                    sellPrice = animal.sellPrice
                    break
                }
                case PlacedItemType.Fruit: {
                    const fruit = this.staticService.fruits.find(
                        (fruit) => fruit.id === placedItemType.fruit.toString()
                    )
                    if (!fruit) {
                        throw new WsException("Fruit not found")
                    }
                    if (!fruit.sellable) {
                        throw new WsException("Fruit not sellable")
                    }
                    if (!fruit.sellPrice) {
                        throw new WsException("Fruit sell price not found")
                    }
                    sellPrice = fruit.sellPrice
                    break
                }
                case PlacedItemType.Pet: {
                    const pet = this.staticService.pets.find(
                        (pet) => pet.id === placedItemType.pet.toString()
                    )
                    if (!pet) {
                        throw new WsException("Pet not found")
                    }
                    if (!pet.sellable) {
                        throw new WsException("Pet not sellable")
                    }
                    if (!pet.sellPrice) {
                        throw new WsException("Pet sell price not found")
                    }
                    sellPrice = pet.sellPrice
                    break
                }
                default: {
                    throw new WsException("Invalid placed item type")
                }
                }
                /************************************************************
                 * RETRIEVE AND UPDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }
                const userSnapshot = user.$clone()

                // Add gold from selling
                this.goldBalanceService.add({
                    user: user,
                    amount: sellPrice
                })

                // Update user with gold changes
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
                /************************************************************
                 * REMOVE PLACED ITEM
                 ************************************************************/
                await placedItem.deleteOne({ session })
                const deletedSyncedPlacedItems = this.syncService.getDeletedSyncedPlacedItems({
                    placedItemIds: [placedItem.id]
                })
                syncedPlacedItems.push(...deletedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.Sell,
                    success: true,
                    userId,
                }
                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionMessage
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                return {
                    action: actionMessage
                }
            }
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
