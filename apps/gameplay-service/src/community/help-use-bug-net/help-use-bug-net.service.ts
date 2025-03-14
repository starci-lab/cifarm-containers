import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    FRUIT_INFO,
    FruitCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { HelpUseBugNetRequest, HelpUseBugNetResponse } from "./help-use-bug-net.dto"

@Injectable()
export class HelpUseBugNetService {
    private readonly logger = new Logger(HelpUseBugNetService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
    ) {}

    async helpUseBugNet({ placedItemFruitId, userId }: HelpUseBugNetRequest): Promise<HelpUseBugNetResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let neighborUserId: string | undefined
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const placedItemFruit = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemFruitId)
                    .populate(FRUIT_INFO)
                    .session(session)

                if (!placedItemFruit) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.HelpUseBugNet,
                        success: false,
                        userId,
                        reasonCode: 0,
                    }
                    throw new GrpcNotFoundException("Placed item fruit not found")
                }

                neighborUserId = placedItemFruit.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.HelpUseBugNet,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new GrpcFailedPreconditionException("Cannot help use bug net on your own tile")
                }

                if (placedItemFruit.fruitInfo.currentState !== FruitCurrentState.IsInfested) {
                    actionMessage = {
                        placedItemId: placedItemFruitId,
                        action: ActionName.HelpUseBugNet,
                        success: false,
                        userId,
                        reasonCode: 3,
                    }
                    throw new GrpcFailedPreconditionException("Fruit is not infested")
                }

                const { value } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById(createObjectId(SystemId.Activities))
                    .session(session)
                
                const { helpUseBugNet: { energyConsume, experiencesGain } } = value as Activities

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume,
                })

                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume,
                })
                const experiencesChanges = this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain,
                })

                // Update the user and placed item fruit in one session
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                    .session(session)

                placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
                await placedItemFruit.save({
                    session
                })

                // Kafka producer actions (sending them in parallel)
                actionMessage = {
                    placedItemId: placedItemFruitId,
                    action: ActionName.HelpUseBugNet,
                    success: true,
                    userId,
                }

                return {} // Return empty response after success
            })

            // Using Promise.all() to send Kafka messages concurrently
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

            return result // Return the result from the transaction
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }],
                })
            }
            // withTransaction automatically handles rollback
            throw error
        } finally {
            await mongoSession.endSession() // End the session after transaction completes
        }
    }
}
