import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { EnergyService, LevelService } from "@src/gameplay"
import { HelpUseHerbicideRequest, HelpUseHerbicideResponse } from "./help-use-herbicide.dto"
import { Connection } from "mongoose"
import {
    Activities,
    CropCurrentState,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Injectable()
export class HelpUseHerbicideService {
    private readonly logger = new Logger(HelpUseHerbicideService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpUseHerbicide({
        placedItemTileId,
        userId
    }: HelpUseHerbicideRequest): Promise<HelpUseHerbicideResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: EmitActionPayload | undefined
        try {
            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .session(mongoSession)

            if (!placedItemTile) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpUseHerbicide,
                    success: false,
                    userId,
                    reasonCode: 0,
                }
                throw new GrpcFailedPreconditionException("Tile is found")
            }
            const neighborUserId = placedItemTile.user.toString()
            if (neighborUserId === userId) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpUseHerbicide,
                    success: false,
                    userId,
                    reasonCode: 1,
                }
                throw new GrpcFailedPreconditionException("Cannot use herbicide on own tile")
            }
            if (!placedItemTile.seedGrowthInfo) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpUseHerbicide,
                    success: false,
                    userId,
                    reasonCode: 2,
                }
                throw new GrpcFailedPreconditionException("Tile is not planted")
            }
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpUseHerbicide,
                    success: false,
                    userId,
                    reasonCode: 3,
                }
                throw new GrpcFailedPreconditionException("Tile does not need herbicide")
            }

            const { value } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                .session(mongoSession)

            const { helpUseHerbicide: { energyConsume, experiencesGain } } = value as Activities

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const energyChanges = this.energyService.substract({
                user,
                quantity: energyConsume,
            })
            const experienceChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...energyChanges, ...experienceChanges }
            ).session(mongoSession)

            placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
            await placedItemTile.save({ session: mongoSession })

            await mongoSession.commitTransaction()

            // Kafka action message
            actionMessage = {
                placedItemId: placedItemTileId,
                action: ActionName.HelpUseHerbicide,
                success: true,
                userId,
            }

            // Sending both Kafka messages in parallel using Promise.all()
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId: neighborUserId }) }],
                })
            ])

            return {} // Return an empty response after success
        } catch (error) {
            // If there was an error, send the action message with failure status
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                })
            }
            await mongoSession.abortTransaction() // Abort transaction on error
            throw error
        } finally {
            await mongoSession.endSession() // End the session after transaction completes
        }
    }
}
