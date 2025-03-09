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
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
    ) {}

    async helpCureAnimal({
        placedItemAnimalId,
        userId
    }: HelpCureAnimalRequest): Promise<HelpCureAnimalResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: EmitActionPayload | undefined

        try {
            const placedItemAnimal = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemAnimalId)
                .session(mongoSession)

            if (!placedItemAnimal) {
                throw new GrpcNotFoundException("Placed item animal not found")
            }

            const neighborUserId = placedItemAnimal.user.toString()
            if (neighborUserId === userId) {
                throw new GrpcFailedPreconditionException(
                    "Cannot help cure on your own tile"
                )
            }

            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
                throw new GrpcFailedPreconditionException("Animal is not sick")
            }

            const { value } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById(createObjectId(SystemId.Activities))
                .session(mongoSession)
            const {
                helpCureAnimal: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const energyChanges = this.energyService.substract({
                user,
                quantity: energyConsume
            })
            const experiencesChanges = this.levelService.addExperiences({
                user,
                experiences: experiencesGain
            })

            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne({ _id: user.id }, { ...energyChanges, ...experiencesChanges })
                .session(mongoSession)

            await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .updateOne(
                    { _id: placedItemAnimal.id },
                    { currentState: AnimalCurrentState.Normal }
                )
                .session(mongoSession)
            await mongoSession.commitTransaction()

            actionMessage = {
                placedItemId: placedItemAnimalId,
                action: ActionName.HelpCureAnimal,
                success: true,
                userId: neighborUserId,
            }
            this.kafkaProducer.send({
                topic: KafkaTopic.EmitAction,
                messages: [{ value: JSON.stringify(actionMessage) }]
            })
            this.kafkaProducer.send({
                topic: KafkaTopic.SyncPlacedItems,
                messages: [{ value: JSON.stringify({ userId: neighborUserId }) }]
            })

            return {}
        } catch (error) {
            this.logger.error(error)
            if (actionMessage)
            {
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }  
            await mongoSession.endSession()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
