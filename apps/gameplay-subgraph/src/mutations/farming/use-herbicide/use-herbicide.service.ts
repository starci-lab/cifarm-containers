import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseHerbicideRequest } from "./use-herbicide.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UseHerbicideService {
    private readonly logger = new Logger(UseHerbicideService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async useHerbicide(
        { id: userId }: UserLike,
        { placedItemTileId }: UseHerbicideRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession() // Create the session
        let actionMessage: EmitActionPayload | undefined

        try {
            // Using withTransaction to automatically handle session and transaction
            await mongoSession.withTransaction(async (session) => {
                // Fetch the placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    throw new GraphQLError("Tile not found", {
                        extensions: {
                            code: "TILE_NOT_FOUND"
                        }
                    })
                }

                if (placedItemTile.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use herbicide on other's tile", {
                        extensions: {
                            code: "UNAUTHORIZED_HERBICIDE"
                        }
                    })
                }

                if (!placedItemTile.seedGrowthInfo) {
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_NOT_PLANTED"
                        }
                    })
                }

                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy) {
                    throw new GraphQLError("Tile is not weedy", {
                        extensions: {
                            code: "TILE_NOT_WEEDY"
                        }
                    })
                }

                // Fetch system configuration (activity settings)
                const { energyConsume, experiencesGain } = this.staticService.activities.useHerbicide

                // Fetch user data
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

                // Check if the user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Subtract energy and add experience
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume
                })
                const experienceChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Update the user data
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experienceChanges })
                    .session(session)

                // Update placed item tile state
                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                await placedItemTile.save({ session })

                // Prepare the action message for success
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.UseHerbicide,
                    success: true,
                    userId
                }

                // No return value needed for void
            })

            // Send Kafka messages for both actions
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

            // No return value needed for void
        } catch (error) {
            // Handle error and send the action message even if failure occurs
            this.logger.error(`Transaction failed, reason: ${error.message}`)

            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // Since withTransaction automatically handles rollback, no need to manually abort the transaction
            throw error // Re-throwing the error after logging and handling the action message
        } finally {
            // End the session after the transaction
            await mongoSession.endSession()
        }
    }
}
