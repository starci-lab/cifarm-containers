import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Activities, CropCurrentState, InjectMongoose, PlacedItemSchema, SystemId, KeyValueRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UsePesticideRequest, UsePesticideResponse } from "./use-pesticide.dto"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"

@Injectable()
export class UsePesticideService {
    private readonly logger = new Logger(UsePesticideService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async usePesticide({ placedItemTileId, userId}: UsePesticideRequest): Promise<UsePesticideResponse> {
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
                    action: ActionName.UsePesticide,
                    success: false,
                    userId,
                    reasonCode: 0,
                }
                throw new GrpcFailedPreconditionException("Tile is found")
            }
            if (placedItemTile.user.toString() !== userId) throw new GrpcFailedPreconditionException("Cannot use pesticide on other's tile")
            if (!placedItemTile.seedGrowthInfo) throw new GrpcFailedPreconditionException("Tile is not planted")
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsInfested) throw new GrpcFailedPreconditionException("Tile is not infested")

            const { value: {
                usePesticide: {
                    energyConsume,
                    experiencesGain
                }
            } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                .session(mongoSession)
                
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

            actionMessage = {
                placedItemId: placedItemTileId,
                action: ActionName.UsePesticide,
                success: true,
                userId,
            }
            this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, { userId })
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            if (actionMessage)
            {
                this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            }   
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
