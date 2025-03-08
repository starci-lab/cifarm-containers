import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { 
    InjectKafka, 
    KafkaPattern} from "@src/brokers"
import {
    Activities,
    CropCurrentState,
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
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"

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

        let actionMessage: EmitActionPayload | undefined

        try {
            const placedItemTile = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .session(mongoSession)

            if (!placedItemTile) {
                throw new GrpcNotFoundException("Placed item tile not found")
            }

            if (placedItemTile.user.toString() === userId) {
                throw new GrpcFailedPreconditionException(
                    "Cannot help water on your own tile"
                )
            }

            if (!placedItemTile.seedGrowthInfo) {
                throw new GrpcFailedPreconditionException("Tile is not planted")
            }

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) {
                throw new GrpcFailedPreconditionException("Tile does not need water")
            }

            const { value } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById(createObjectId(SystemId.Activities))
                .session(mongoSession)
            const {
                helpWater: { energyConsume, experiencesGain }
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

            placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
            await placedItemTile.save({ session: mongoSession })
            await mongoSession.commitTransaction()

            actionMessage = {
                placedItemId: placedItemTileId,
                action: ActionName.HelpWater,
                success: true,
                userId: neighborUserId,
            }
            this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, { userId: neighborUserId })

            return {}
        } catch (error) {
            this.logger.error(error)
            if (actionMessage)
            {
                this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            }  
            await mongoSession.endSession()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
