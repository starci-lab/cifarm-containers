import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryTypeId,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService, StaticService, SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { WaterCropRequest } from "./water-crop.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, DeepPartial, WithStatus, SchemaStatus } from "@src/common"

@Injectable()
export class WaterCropService {
    private readonly logger = new Logger(WaterCropService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async waterCrop(
        { id: userId }: UserLike,
        { placedItemTileId }: WaterCropRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
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
                    .session(session)

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

                // Get placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                // Validate tile exists
                if (!placedItemTile) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.WaterCrop,
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

                syncedPlacedItemAction = {
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    id: placedItemTile._id.toString(),
                    placedItemType: placedItemTile.placedItemType
                }

                // Validate ownership
                if (placedItemTile.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use water on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_WATERING"
                        }
                    })
                }

                // Validate tile is planted
                if (!placedItemTile.seedGrowthInfo) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.WaterCrop,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_NOT_PLANTED"
                        }
                    })
                }

                // Validate tile needs water
                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.WaterCrop,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Tile does not need water", {
                        extensions: {
                            code: "TILE_DOES_NOT_NEED_WATER"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/

                // Get user data
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                // Validate user exists
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE ACTIVITY DATA
                 ************************************************************/

                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.waterCrop

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
                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })

                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                await user.save({ session })

                // Update tile state
                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                await placedItemTile.save({ session })
                const updatedSyncedPlacedItem = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemTile],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(
                    ...updatedSyncedPlacedItem
                )

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.WaterCrop,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [
                        { value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }
                    ]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: this.syncService.getSyncedUser(user) }) }]
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
            await mongoSession.endSession()
        }
    }
}
