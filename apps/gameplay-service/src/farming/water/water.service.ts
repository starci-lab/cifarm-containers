import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Activities, CropCurrentState, InjectMongoose, PlacedItemSchema, SEED_GROWTH_INFO, SystemId, KeyValueRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { WaterRequest, WaterResponse } from "./water.dto"

@Injectable()
export class WaterService {
    private readonly logger = new Logger(WaterService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async water(request: WaterRequest): Promise<WaterResponse> {
        this.logger.debug(`Watering tile for user ${request.userId}, tile ID: ${request.placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemTileId)
                .populate(SEED_GROWTH_INFO)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (!placedItemTile.seedGrowthInfo) throw new GrpcFailedPreconditionException("Tile is not planted")
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) throw new GrpcFailedPreconditionException("Tile does not need water")

            const { value: {
                water: {
                    energyConsume,
                    experiencesGain
                }
            } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities)).session(mongoSession)

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
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

            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                { _id: placedItemTile._id },
                { "seedGrowthInfo.currentState": CropCurrentState.Normal }
            ).session(mongoSession)
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw new GrpcInternalException(error.message)
        } finally {
            await mongoSession.endSession()
        }
    }
}
