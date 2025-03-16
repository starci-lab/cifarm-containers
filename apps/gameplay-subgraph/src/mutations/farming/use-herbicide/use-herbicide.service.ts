import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    Activities,
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UseHerbicideRequest } from "./use-herbicide.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"
import { UserLike } from "@src/jwt"

@Injectable()
export class UseHerbicideService {
    private readonly logger = new Logger(UseHerbicideService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
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
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.UseHerbicide,
                        success: false,
                        userId,
                        reasonCode: 0
                    }
                    throw new NotFoundException("Tile not found")
                }

                if (placedItemTile.user.toString() !== userId) {
                    throw new BadRequestException("Cannot use herbicide on other's tile")
                }

                if (!placedItemTile.seedGrowthInfo) {
                    throw new BadRequestException("Tile is not planted")
                }

                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy) {
                    throw new BadRequestException("Tile is not weedy")
                }

                // Fetch system configuration (activity settings)
                const {
                    value: {
                        useHerbicide: { energyConsume, experiencesGain }
                    }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new NotFoundException("User not found")

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
