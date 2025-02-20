import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Activities, CropCurrentState, InjectMongoose, PlacedItemSchema, SEED_GROWTH_INFO, SystemId, KeyValueRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UseHerbicideRequest, UseHerbicideResponse } from "./use-herbicide.dto"

@Injectable()
export class UseHerbicideService {
    private readonly logger = new Logger(UseHerbicideService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async useHerbicide(request: UseHerbicideRequest): Promise<UseHerbicideResponse> {
        this.logger.debug(`Applying herbicide for user ${request.userId}, tile ID: ${request.placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemTileId)
                .populate(SEED_GROWTH_INFO)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (!placedItemTile.seedGrowthInfo) throw new GrpcFailedPreconditionException("Tile is not planted")
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy) throw new GrpcFailedPreconditionException("Tile is not weedy")

            const { value: {
                useHerbicide: {
                    energyConsume,
                    experiencesGain
                }
            } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                .session(mongoSession)
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
            this.logger.error(`Transaction failed, reason: ${error.message}`)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
