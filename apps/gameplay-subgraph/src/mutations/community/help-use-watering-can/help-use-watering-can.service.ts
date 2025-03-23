import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    PlantCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema,
    InventorySchema,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { EnergyService, LevelService, StaticService, SyncService } from "@src/gameplay"
import { HelpUseWateringCanRequest } from "./help-use-watering-can.dto"
import { Connection } from "mongoose"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class HelpUseWateringCanService {
    private readonly logger = new Logger(HelpUseWateringCanService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUseWateringCan(
        { id: userId }: UserLike,
        { placedItemTileId }: HelpUseWateringCanRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let neighborUserId: string | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []

        try {
            // Using session.withTransaction for MongoDB operations and automatic transaction handling
            await mongoSession.withTransaction(async () => {
                /************************************************************
                 * RETRIEVE AND VALIDATE WATERING CAN TOOL
                 ************************************************************/

                // Check if user has watering can
                const inventoryWateringCanExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.WateringCan),
                        kind: InventoryKind.Tool
                    })
                    .session(mongoSession)

                // Validate watering can exists in inventory
                if (!inventoryWateringCanExisted) {
                    throw new GraphQLError("Watering can not found in toolbar", {
                        extensions: {
                            code: "WATERING_CAN_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TILE
                 ************************************************************/
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(mongoSession)

                if (!placedItemTile) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseWateringCan,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }

                // Update synced placed item
                syncedPlacedItemAction = {
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    id: placedItemTile.id,
                    placedItemType: placedItemTile.placedItemType
                }

                neighborUserId = placedItemTile.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseWateringCan,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Cannot help water on your own tile", {
                        extensions: {
                            code: "CANNOT_HELP_SELF"
                        }
                    })
                }

                if (!placedItemTile.plantInfo) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseWateringCan,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_NOT_PLANTED"
                        }
                    })
                }

                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.NeedWater) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseWateringCan,
                        success: false,
                        userId,
                        reasonCode: 3
                    }
                    throw new GraphQLError("Tile does not need water", {
                        extensions: {
                            code: "TILE_NOT_NEED_WATER"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch system activity values
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUseWateringCan

                user = await this.connection
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

                // Check if user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/
                // Apply energy and experience changes
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })
                this.levelService.addExperiences({ user, experiences: experiencesGain })

                // Update the user
                await user.save({ session: mongoSession })

                // Update placed item tile state
                placedItemTile.plantInfo.currentState = PlantCurrentState.Normal
                await placedItemTile.save({ session: mongoSession })
                // Update synced placed item
                const updatedSyncedPlacedItem =
                    this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                        placedItems: [placedItemTile],
                        status: SchemaStatus.Updated
                    })
                syncedPlacedItems.push(...updatedSyncedPlacedItem)

                // Prepare action message for Kafka
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.HelpUseWateringCan,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Send Kafka messages in parallel
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId: neighborUserId,
                                placedItems: syncedPlacedItems
                            })
                        }
                    ]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId,
                                user: this.syncService.getSyncedUser(user)
                            })
                        }
                    ]
                })
            ])

            // No return value needed for void
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
            await mongoSession.endSession()
        }
    }
}
