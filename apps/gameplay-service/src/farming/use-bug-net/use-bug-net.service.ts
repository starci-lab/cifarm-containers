import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Activities, FRUIT_INFO, FruitCurrentState, InjectMongoose, KeyValueRecord, PlacedItemSchema, SystemId, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UseBugNetRequest, UseBugNetResponse } from "./use-bug-net.dto"

@Injectable()
export class UseBugNetService {
    private readonly logger = new Logger(UseBugNetService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async useBugNet({ placedItemFruitId, userId }: UseBugNetRequest): Promise<UseBugNetResponse> {
        const mongoSession = await this.connection.startSession() // Create the session
        let actionMessage: EmitActionPayload | undefined

        try {
            // Using withTransaction to automatically handle session and transaction
            const result = await mongoSession.withTransaction(async (session) => {
                // Fetch the placed item tile
                const placedItemFruit = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .populate(FRUIT_INFO)
                    .session(session)

                if (!placedItemFruit) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.UseBugNet,
                        success: false,
                        userId,
                        reasonCode: 0,
                    }
                    throw new GrpcNotFoundException("Fruit not found")
                }

                if (placedItemFruit.user.toString() !== userId) {
                    throw new GrpcFailedPreconditionException("Cannot use bugnet on other's tile")
                }

                if (!placedItemFruit.fruitInfo) {
                    throw new GrpcFailedPreconditionException("Fruit is not planted")
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.IsInfested) {
                    throw new GrpcFailedPreconditionException("Fruit is not weedy")
                }

                // Fetch system configuration (activity settings)
                const { value: { useBugNet: { energyConsume, experiencesGain } } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                    .session(session)

                // Fetch user data
                const user = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new GrpcNotFoundException("User not found")

                // Check if the user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                // Subtract energy and add experience
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume,
                })
                const experienceChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Update the user data
                await this.connection.model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        { ...energyChanges, ...experienceChanges }
                    )
                    .session(session)

                // Update placed item tile state
                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({ session })

                // Prepare the action message for success
                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.UseBugNet,
                    success: true,
                    userId,
                }

                return {} // Successful result after all operations
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

            return result
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
