import { ActionName, EmitActionPayload, SellData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    AnimalSchema,
    BUILDING_INFO,
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    TileSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { SellRequest } from "./sell.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class SellService {
    private readonly logger = new Logger(SellService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async sell({ id: userId }: UserLike, { placedItemId }: SellRequest): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<SellData> | undefined

        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .populate(BUILDING_INFO)
                    .session(mongoSession)

                if (!placedItem) {
                    throw new GraphQLError("Placed item not found", {
                        extensions: {
                            code: "PLACED_ITEM_NOT_FOUND"
                        }
                    })
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
                const placedItemType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findById(placedItem.placedItemType)
                    .session(mongoSession)

                if (!placedItemType.sellable) {
                    throw new GraphQLError("Item not sellable", {
                        extensions: {
                            code: "ITEM_NOT_SELLABLE"
                        }
                    })
                }

                /************************************************************
                 * DETERMINE SELL PRICE BASED ON ITEM TYPE
                 ************************************************************/
                let sellPrice: number = 0

                switch (placedItemType.type) {
                case PlacedItemType.Building: {
                    const building = await this.connection
                        .model<BuildingSchema>(BuildingSchema.name)
                        .findById(placedItemType.building)
                        .session(mongoSession)

                    if (!building) {
                        throw new GraphQLError("Building not found", {
                            extensions: {
                                code: "BUILDING_NOT_FOUND"
                            }
                        })
                    }
                    const upgradeLevel = placedItem?.buildingInfo?.currentUpgrade ?? 1
                    const upgradePrice =
                            building.upgrades?.find(
                                (upgrade) => upgrade.upgradeLevel === upgradeLevel
                            )?.sellPrice ?? 0
                    sellPrice = upgradePrice
                    break
                }
                case PlacedItemType.Tile: {
                    const tile = await this.connection
                        .model<TileSchema>(TileSchema.name)
                        .findById(placedItemType.tile)
                        .session(mongoSession)
                    if (!tile) {
                        throw new GraphQLError("Tile not found", {
                            extensions: {
                                code: "TILE_NOT_FOUND"
                            }
                        })
                    }
                    sellPrice = tile.sellPrice ?? 0
                    break
                }
                case PlacedItemType.Animal: {
                    const animal = await this.connection
                        .model<AnimalSchema>(AnimalSchema.name)
                        .findById(placedItemType.animal)
                        .session(mongoSession)
                    if (!animal) {
                        throw new GraphQLError("Animal not found", {
                            extensions: {
                                code: "ANIMAL_NOT_FOUND"
                            }
                        })
                    }
                    sellPrice = animal.sellPrice ?? 0
                    break
                }
                }

                /************************************************************
                 * RETRIEVE AND UPDATE USER DATA
                 ************************************************************/
                const user: UserSchema = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Add gold from selling
                const goldsChanged = this.goldBalanceService.add({
                    user: user,
                    amount: sellPrice
                })

                // Update user with gold changes
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged })
                    .session(mongoSession)

                /************************************************************
                 * REMOVE PLACED ITEM
                 ************************************************************/
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .deleteOne({ _id: placedItemId })
                    .session(mongoSession)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionMessage = {
                    placedItemId: placedItemId,
                    action: ActionName.Sell,
                    success: true,
                    userId,
                    data: {
                        quantity: sellPrice
                    }
                }
            })

            /************************************************************
             * SEND KAFKA MESSAGES
             ************************************************************/
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
