import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"
import { MoveRequest } from "./move.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { DeepPartial, SchemaStatus } from "@src/common"
import { WithStatus } from "@src/common"
import { PositionService, SyncService, StaticService } from "@src/gameplay"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly syncService: SyncService,
        private readonly staticService: StaticService,
        private readonly positionService: PositionService
    ) {}

    async move(
        { id: userId }: UserLike,
        { placedItemId, position }: MoveRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined    
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined        
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []
    
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

                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.id === placedItem.placedItemType
                )

                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }
                /************************************************************
                 * CHECK IF POSITION IS AVAILABLE
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    connection: this.connection,
                    userId
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })
                

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
                 * UPDATE PLACED ITEM POSITION
                 ************************************************************/
                // Update the placed item position in the database
                placedItem.x = position.x
                placedItem.y = position.y
                await placedItem.save({ session })
                const updatedSyncedPlacedItem = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItem],
                    status: SchemaStatus.Updated
                })
                syncedPlacedItems.push(...updatedSyncedPlacedItem)  

                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.Move,
                    success: true,
                    userId
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
                    messages: [{ value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }]
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
            await mongoSession.endSession()  // End the session after the transaction
        }
    }
}
