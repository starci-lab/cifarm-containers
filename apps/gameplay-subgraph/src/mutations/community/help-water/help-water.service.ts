import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    Activities,
    CropCurrentState,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema,
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { HelpWaterRequest } from "./help-water.dto"
import { Connection } from "mongoose"
import { EmptyObjectType, createObjectId } from "@src/common"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"

@Injectable()
export class HelpWaterService {
    private readonly logger = new Logger(HelpWaterService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpWater(
        { id: userId }: UserLike,
        { placedItemTileId }: HelpWaterRequest
    ): Promise<EmptyObjectType> {
        const mongoSession = await this.connection.startSession()
        
        let actionMessage: EmitActionPayload | undefined
        let neighborUserId: string | undefined
        try {
            // Using session.withTransaction for MongoDB operations and automatic transaction handling
            await mongoSession.withTransaction(async () => {
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(mongoSession)

                if (!placedItemTile) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.HelpWater,
                        success: false,
                        userId,
                        reasonCode: 0,
                    }
                    throw new NotFoundException("Tile is not found")
                }

                neighborUserId = placedItemTile.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.HelpWater,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new BadRequestException("Cannot help water on your own tile")
                }

                if (!placedItemTile.seedGrowthInfo) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.HelpWater,
                        success: false,
                        userId,
                        reasonCode: 2,
                    }
                    throw new BadRequestException("Tile is not planted")
                }

                if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) {
                    actionMessage = {
                        placedItemId: placedItemTileId,
                        action: ActionName.HelpWater,
                        success: false,
                        userId,
                        reasonCode: 3,
                    }
                    throw new BadRequestException("Tile does not need water")
                }

                // Fetch system activity values
                const { value: { helpWater: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(mongoSession)

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) throw new NotFoundException("User not found")

                // Check if user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume,
                })

                // Apply energy and experience changes
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume,
                })
                const experienceChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...energyChanges, ...experienceChanges }
                ).session(mongoSession)

                // Update placed item tile state
                placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
                await placedItemTile.save({ session: mongoSession })

                // Prepare action message for Kafka
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpWater,
                    success: true,
                    userId,
                }
            })

            // Send Kafka messages in parallel
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId }) }],
                }),
            ])

            // Return empty response after successful commit
            return {}
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                // Send failure action message in case of error
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                })
            }

            throw error // Rethrow error for handling by higher layers
        } finally {
            await mongoSession.endSession() // End session after transaction completes
        }
    }
}
