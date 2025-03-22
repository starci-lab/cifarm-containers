import { ActionName, EmitActionPayload, BuyTileData } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService, SyncService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { BuyTileRequest } from "./buy-tile.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { SchemaStatus } from "@src/common"      
@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async buyTile(
        { id: userId }: UserLike,
        { position, tileId }: BuyTileRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        
        // synced variables
        let actionMessage: EmitActionPayload<BuyTileData> | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
            
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE TILE
                 ************************************************************/
                // Fetch tile details
                const tile = this.staticService.tiles.find(
                    (tile) => tile.displayId === tileId
                )
                if (!tile) {
                    throw new GraphQLError("Tile not found in static service", {
                        extensions: {
                            code: "TILE_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }
                
                if (!tile.availableInShop) {
                    throw new GraphQLError("Tile not available in shop", {
                        extensions: {
                            code: "TILE_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                const { tileLimit } = this.staticService.defaultInfo

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                user = await this.connection
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

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tile.price
                })

                /************************************************************
                 * CHECK TILE LIMITS
                 ************************************************************/
                // Check the number of tiles owned by the user
                const count = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: createObjectId(tileId)
                    })
                    .session(session)

                if (count >= tileLimit) {
                    throw new GraphQLError("Max ownership reached", {
                        extensions: {
                            code: "MAX_OWNERSHIP_REACHED"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: tile.price
                })

                // Save updated user data
                await user.save({ session })

                /************************************************************
                 * PLACE TILE
                 ************************************************************/
                // Save the placed item (tile) in the database
                const [placedItemTileRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: createObjectId(tileId),
                                tileInfo: {}
                            }
                        ],
                        { session }
                    )
                syncedPlacedItemAction = {
                    id: placedItemTileRaw._id.toString(),
                    x: placedItemTileRaw.x,
                    y: placedItemTileRaw.y,
                    placedItemType: placedItemTileRaw.placedItemType,
                }
                const createdSyncedPlacedItems = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemTileRaw],
                    status: SchemaStatus.Created
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)
                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action message to emit to Kafka
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.BuyTile,
                    success: true,
                    userId,
                    data: {
                        price: tile.price,
                    }
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Send Kafka messages for success
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId, placedItems: syncedPlacedItems })}]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: this.syncService.getSyncedUser(user) }) }]
                })  
            ])
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionMessage) {
                actionMessage.success = false
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
