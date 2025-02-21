import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { 
    InjectKafka, 
    KafkaPattern} from "@src/brokers"
import {
    Activities,
    AnimalCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema,
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { HelpWaterRequest, HelpWaterResponse } from "./help-water.dto"
import { Connection } from "mongoose"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException, createObjectId } from "@src/common"

@Injectable()
export class HelpWaterService {
    private readonly logger = new Logger(HelpWaterService.name)

    constructor(
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpWater(
        { neighborUserId, placedItemTileId, userId }: HelpWaterRequest
    ): Promise<HelpWaterResponse> {
        if (userId === neighborUserId) {
            throw new GrpcInvalidArgumentException("Cannot help water yourself")
        }

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const placedItemAnimal = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .session(mongoSession)

            if (!placedItemAnimal) {
                throw new GrpcNotFoundException("Placed item animal not found")
            }

            if (placedItemAnimal.user.toString() === userId) {
                throw new GrpcFailedPreconditionException(
                    "Cannot help water on your own tile"
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

            placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
            await placedItemAnimal.save({ session: mongoSession })
            await mongoSession.commitTransaction()

            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: neighborUserId
            })

            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.endSession()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
