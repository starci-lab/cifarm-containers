import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { ActivityInfo, InjectMongoose, PlacedItemSchema, SEED_GROWTH_INFO, SystemId, SystemRecord, SystemSchema, UserSchema } from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UseFertilizerRequest, UseFertilizerResponse } from "./use-fertilizer.dto"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async useFertilizer(request: UseFertilizerRequest): Promise<UseFertilizerResponse> {
        this.logger.debug(`Applying fertilizer for user ${request.userId}, tile ID: ${request.placedItemTileId}`)

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const placedItemTile = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemTileId)
                .populate(SEED_GROWTH_INFO)
                .session(mongoSession)

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")
            if (!placedItemTile.seedGrowthInfo) throw new GrpcNotFoundException("Tile is not planted")
            if (placedItemTile.seedGrowthInfo.isFertilized) throw new GrpcFailedPreconditionException("Tile is already fertilized")

            const { value: {
                energyConsume,
                experiencesGain
            } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<ActivityInfo>>(createObjectId(SystemId.Activities))

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            try {
                const energyChanges = this.energyService.substract({
                    user,
                    quantity: energyConsume,
                })
                const experienceChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...energyChanges, ...experienceChanges }
                )

                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                    { _id: placedItemTile._id },
                    { 
                        seedGrowthInfo: {
                            isFertilized: true,
                        }
                    }
                )

                await mongoSession.commitTransaction()
                return {}
            } catch (error) {
                this.logger.error(`Transaction failed, reason: ${error.message}`)
                await mongoSession.abortTransaction()
                throw new GrpcInternalException(error.message)
            }
        } finally {
            await mongoSession.endSession()
        }
    }
}
