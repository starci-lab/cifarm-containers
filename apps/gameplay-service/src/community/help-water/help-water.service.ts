import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { 
    InjectKafka, 
    KafkaPattern} from "@src/brokers"
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
import { HelpWaterRequest, HelpWaterResponse } from "./help-water.dto"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
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
        { placedItemTileId, userId }: HelpWaterRequest
    ): Promise<HelpWaterResponse> {
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
                    action: ActionName.HelpWater,
                    success: false,
                    userId,
                    reasonCode: 0,
                }
                throw new GrpcFailedPreconditionException("Tile is found")
            }
            if (placedItemTile.user.toString() === userId) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpWater,
                    success: false,
                    userId,
                    reasonCode: 1,
                }
                throw new GrpcFailedPreconditionException("Cannot help water on your own tile")
            } 
            if (!placedItemTile.seedGrowthInfo) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpWater,
                    success: false,
                    userId,
                    reasonCode: 2,
                }
                throw new GrpcFailedPreconditionException("Tile is not planted")
            }
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) {
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.HelpWater,
                    success: false,
                    userId,
                    reasonCode: 3,
                }
                throw new GrpcFailedPreconditionException("Tile does not need water")
            }

            const { value: {
                helpWater: {
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

            await mongoSession.commitTransaction()

            actionMessage = {
                placedItemId: placedItemTileId,
                action: ActionName.HelpWater,
                success: true,
                userId,
            }
            this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, { userId: placedItemTile.user.toString() })
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
