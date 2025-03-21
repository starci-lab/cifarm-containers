import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema,
    InventorySchema,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { EnergyService, LevelService, StaticService, SyncService } from "@src/gameplay"
import { HelpUsePesticideRequest } from "./help-use-pesticide.dto"
import { Connection } from "mongoose"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class HelpUsePesticideService {
    private readonly logger = new Logger(HelpUsePesticideService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUsePesticide(
        { id: userId }: UserLike,
        { placedItemTileId }: HelpUsePesticideRequest
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
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PESTICIDE TOOL
                 ************************************************************/
                const inventoryPesticide = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Pesticide),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                if (!inventoryPesticide) {
                    throw new GraphQLError("Pesticide not found", {
                        extensions: {
                            code: "PESTICIDE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TILE
                 ************************************************************/
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)
                
                if (!placedItemTile) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUsePesticide,
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


                // Validate ownership (must be someone else's tile)
                neighborUserId = placedItemTile.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUsePesticide,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Cannot use pesticide on your own tile", {
                        extensions: {
                            code: "CANNOT_USE_PESTICIDE_ON_YOUR_OWN_TILE"
                        }
                    })
                }

                // Validate tile has seed growth info
                if (!placedItemTile.seedGrowthInfo) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUsePesticide,
                        success: false,
                        userId,
                        reasonCode: 2
                    }
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_IS_NOT_PLANTED"
                        }
                    })
                }

                // Validate tile needs pesticide
                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsInfested) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUsePesticide,
                        success: false,
                        userId,
                        reasonCode: 3
                    }
                    throw new GraphQLError("Tile is not infested", {
                        extensions: {
                            code: "TILE_IS_NOT_INFESTED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUsePesticide

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

                // Validate energy is sufficient
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/
                // Apply energy and experience changes
                this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Update the user
                await user.save({ session })

                // Update crop state after using pesticide
                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                await placedItemTile.save({ session })
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
                    action: ActionName.HelpUsePesticide,
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
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                // Send failure action message in case of error
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            throw error // Rethrow error for handling by higher layers
        } finally {
            await mongoSession.endSession() // End session
        }
    }
}
