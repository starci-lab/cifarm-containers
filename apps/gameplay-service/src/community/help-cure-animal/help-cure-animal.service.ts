import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { EnergyService, LevelService } from "@src/gameplay"
import { HelpCureAnimalRequest, HelpCureAnimalResponse } from "./help-cure-animal.dto"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import {
    Activities,
    AnimalCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Injectable()
export class HelpCureAnimalService {
    private readonly logger = new Logger(HelpCureAnimalService.name)

    constructor(
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
    ) {}

    async helpCureAnimal({ placedItemAnimalId, userId }: HelpCureAnimalRequest): Promise<HelpCureAnimalResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        let neighborUserId: string | undefined
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const placedItemAnimal = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemAnimalId)
                    .session(session)

                if (!placedItemAnimal) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpCureAnimal,
                        success: false,
                        userId,
                        reasonCode: 0,
                    }
                    throw new GrpcNotFoundException("Placed item animal not found")
                }

                neighborUserId = placedItemAnimal.user.toString()
                if (neighborUserId === userId) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpCureAnimal,
                        success: false,
                        userId,
                        reasonCode: 1,
                    }
                    throw new GrpcFailedPreconditionException("Cannot help cure on your own tile")
                }

                if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
                    actionMessage = {
                        placedItemId: placedItemAnimalId,
                        action: ActionName.HelpCureAnimal,
                        success: false,
                        userId,
                        reasonCode: 3,
                    }
                    throw new GrpcFailedPreconditionException("Animal is not sick")
                }

                const { value } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById(createObjectId(SystemId.Activities))
                    .session(session)
                
                const { helpCureAnimal: { energyConsume, experiencesGain } } = value as Activities

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

                // Update the user and placed item animal in one session
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                    .session(session)

                placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
                await placedItemAnimal.save({
                    session
                })

                // Kafka producer actions (sending them in parallel)
                actionMessage = {
                    placedItemId: placedItemAnimalId,
                    action: ActionName.HelpCureAnimal,
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
