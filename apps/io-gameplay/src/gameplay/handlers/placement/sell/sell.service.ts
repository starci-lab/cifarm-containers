import { ActionName, EmitActionPayload, SellData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema, PlacedItemType, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService, SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { SellMessage } from "./sell.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { SyncedResponse } from "../../types"
import { DeepPartial, WithStatus } from "@src/common"

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

    async sell({ id: userId }: UserLike, { placedItemId }: SellMessage): Promise<SyncedResponse<SellData>> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload<SellData> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .session(session)

                if (!placedItem) {
                    throw new GraphQLError("Placed item not found", {
                        extensions: {
                            code: "PLACED_ITEM_NOT_FOUND"
                        }
                    })
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
                    throw new GraphQLError("User not match", {
                        extensions: {
                            code: "USER_NOT_MATCH"
                        }
                    })
                }
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TYPE
                 ************************************************************/
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.id === placedItem.placedItemType.toString()
                )
                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }
                /************************************************************
                 * DETERMINE SELL PRICE BASED ON ITEM TYPE
                 ************************************************************/
                let sellPrice: number
                let id: string  
                switch (placedItemType.type) {
                case PlacedItemType.Building: {
                    const building = this.staticService.buildings.find(
                        (building) => building.id === placedItemType.building.toString()
                    )
                    if (!building) {
                        throw new GraphQLError("Building not found", {
                            extensions: {
                                code: "BUILDING_NOT_FOUND"
                            }
                        })
                    }
                    if (!building.sellable) {
                        throw new GraphQLError("Building not sellable", {
                            extensions: {
                                code: "BUILDING_NOT_SELLABLE"
                            }
                        })
                    }
                    if (!building.sellPrice) {
                        throw new GraphQLError("Building sell price not found", {
                            extensions: {
                                code: "BUILDING_SELL_PRICE_NOT_FOUND"
                            }
                        })
                    }
                    sellPrice = building.sellPrice
                    id = building.id
                    break
                }
                case PlacedItemType.Tile: {
                    const tile = this.staticService.tiles.find(
                        (tile) => tile.id === placedItemType.tile.toString()
                    )
                    if (!tile) {
                        throw new GraphQLError("Tile not found", {
                            extensions: {
                                code: "TILE_NOT_FOUND"
                            }
                        })
                    }   
                    if (!tile.sellable) {
                        throw new GraphQLError("Tile not sellable", {
                            extensions: {
                                code: "TILE_NOT_SELLABLE"
                            }
                        })
                    }
                    if (!tile.sellPrice) {
                        throw new GraphQLError("Tile sell price not found", {
                            extensions: {
                                code: "TILE_SELL_PRICE_NOT_FOUND"
                            }
                        })
                    }
                    sellPrice = tile.sellPrice
                    id = tile.id
                    break
                }
                case PlacedItemType.Animal: {
                    // const animal = await this.connection
                    //     .model<AnimalSchema>(AnimalSchema.name)
                    //     .findById(placedItemType.animal)
                    //     .session(mongoSession)
                    const animal = this.staticService.animals.find(
                        (animal) => animal.id === placedItemType.animal.toString()
                    )
                    if (!animal) {
                        throw new GraphQLError("Animal not found", {
                            extensions: {
                                code: "ANIMAL_NOT_FOUND"
                            }
                        })
                    }
                    if (!animal.sellable) {
                        throw new GraphQLError("Animal not sellable", {
                            extensions: {
                                code: "ANIMAL_NOT_SELLABLE"
                            }
                        })
                    }
                    if (!animal.sellPrice) {
                        throw new GraphQLError("Animal sell price not found", {
                            extensions: {
                                code: "ANIMAL_SELL_PRICE_NOT_FOUND"
                            }
                        })
                    }
                    sellPrice = animal.sellPrice
                    id = animal.id
                    break
                }
                case PlacedItemType.Fruit: {
                    const fruit = this.staticService.fruits.find(
                        (fruit) => fruit.id === placedItemType.fruit.toString()
                    )
                    if (!fruit) {
                        throw new GraphQLError("Fruit not found", {
                            extensions: {
                                code: "FRUIT_NOT_FOUND"
                            }
                        })
                    }
                    sellPrice = fruit.sellPrice
                    id = fruit.id
                    break
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
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
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
                    data: {
                        id,
                        type: placedItemType.type
                    }
                }
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                action: actionMessage
            }
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
