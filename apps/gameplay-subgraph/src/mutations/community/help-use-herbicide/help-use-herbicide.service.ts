import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { EnergyService, LevelService, StaticService, SyncService } from "@src/gameplay"
import { HelpUseHerbicideRequest } from "./help-use-herbicide.dto"
import { Connection } from "mongoose"
import {
    PlantCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema,
    InventorySchema,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class HelpUseHerbicideService {
    private readonly logger = new Logger(HelpUseHerbicideService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUseHerbicide(
        { id: userId }: UserLike,
        { placedItemTileId }: HelpUseHerbicideRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let neighborUserId: string | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE HERBICIDE TOOL
                 ************************************************************/
                const inventoryHerbicide = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Herbicide),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                if (!inventoryHerbicide) {
                    throw new GraphQLError("Herbicide not found", {
                        extensions: {
                            code: "HERBICIDE_NOT_FOUND"
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
                        action: ActionName.HelpUseHerbicide,
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
                    id: placedItemTile.id,
                    placedItemType: placedItemTile.placedItemType
                }


                // Validate ownership (must be someone else's tile)
                neighborUserId = placedItemTile.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseHerbicide,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Cannot use herbicide on own tile", {
                        extensions: {
                            code: "CANNOT_USE_HERBICIDE_ON_OWN_TILE"
                        }
                    })
                }

                // Validate tile has seed growth info
                if (!placedItemTile.plantInfo) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseHerbicide,
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

                // Validate tile needs herbicide
                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.IsWeedy) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseHerbicide,
                        success: false,
                        userId,
                        reasonCode: 3
                    }
                    throw new GraphQLError("Tile does not need herbicide", {
                        extensions: {
                            code: "TILE_DOES_NOT_NEED_HERBICIDE"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUseHerbicide

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
                // Update user energy and experience
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

                // Update crop state after using herbicide
                placedItemTile.plantInfo.currentState = PlantCurrentState.Normal
                await placedItemTile.save({ session })
                // Update synced placed item
                const updatedSyncedPlacedItem =
                    this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                        placedItems: [placedItemTile],
                        status: SchemaStatus.Updated
                    })
                syncedPlacedItems.push(...updatedSyncedPlacedItem)

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.HelpUseHerbicide,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Sending both Kafka messages in parallel using Promise.all()
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
            // If there was an error, send the action message with failure status
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
