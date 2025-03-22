import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    FruitCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema,
    InventorySchema,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { EnergyService, LevelService, StaticService, SyncService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { HelpUseBugNetRequest } from "./help-use-bug-net.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class HelpUseBugNetService {
    private readonly logger = new Logger(HelpUseBugNetService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUseBugNet(
        { id: userId }: UserLike,
        { placedItemFruitId }: HelpUseBugNetRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
        let neighborUserId: string | undefined
        
        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE BUG NET TOOL
                 ************************************************************/
                const inventoryBugNet = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.BugNet),
                        kind: InventoryKind.Tool
                    })
                    .session(mongoSession)

                if (!inventoryBugNet) {
                    throw new GraphQLError("Bug net not found", {
                        extensions: {
                            code: "BUG_NET_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM FRUIT
                 ************************************************************/
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .session(mongoSession)
                syncedPlacedItemAction = {
                    id: placedItemFruitId,
                    placedItemType: placedItemFruit.placedItemType,
                    x: placedItemFruit.x,
                    y: placedItemFruit.y
                }
                if (!placedItemFruit) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseBugNet,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new GraphQLError("Placed item fruit not found", {
                        extensions: {
                            code: "PLACED_ITEM_FRUIT_NOT_FOUND"
                        }
                    })
                }

                // Validate ownership (must be someone else's fruit)
                neighborUserId = placedItemFruit.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseBugNet,
                        success: false,
                        userId,
                        reasonCode: 1
                    }
                    throw new GraphQLError("Cannot help use bug net on your own tile", {
                        extensions: {
                            code: "CANNOT_HELP_SELF"
                        }
                    })
                }

                // Validate fruit is infested
                if (
                    !placedItemFruit.fruitInfo ||
                    placedItemFruit.fruitInfo.currentState !== FruitCurrentState.IsInfested
                ) {
                    actionMessage = {
                        placedItem: syncedPlacedItemAction,
                        action: ActionName.HelpUseBugNet,
                        success: false,
                        userId,
                        reasonCode: 3
                    }
                    throw new GraphQLError("Fruit is not infested", {
                        extensions: {
                            code: "FRUIT_NOT_INFESTED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUseBugNet

                // Get user data
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

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
                await user.save({
                    session: mongoSession
                })

                // Update fruit state after using bug net
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({
                    session: mongoSession
                })
                const createdSyncedPlacedItems =
                    this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                        placedItems: [placedItemFruit],
                        status: SchemaStatus.Created
                    })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                // Prepare action message
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.HelpUseBugNet,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Using Promise.all() to send Kafka messages concurrently
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
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            // withTransaction automatically handles rollback
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
