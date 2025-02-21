import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import {
    InjectKafka,
    KafkaPattern
} from "@src/brokers"
import {
    Activities,
    CropCurrentState,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import {
    HelpUsePesticideRequest,
    HelpUsePesticideResponse
} from "./help-use-pesticide.dto"
import { Connection } from "mongoose"
import { GrpcFailedPreconditionException, createObjectId } from "@src/common"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class HelpUsePesticideService {
    private readonly logger = new Logger(HelpUsePesticideService.name)
    constructor(
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpUsePesticide(
        { placedItemTileId, userId }: HelpUsePesticideRequest
    ) : Promise<HelpUsePesticideResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const placedItemTile = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemTileId)
                .session(mongoSession)
            if (!placedItemTile) {
                throw new GrpcNotFoundException("Tile not found")
            }
            const neighborUserId = placedItemTile.user.toString()
            if (neighborUserId === userId) {
                throw new GrpcFailedPreconditionException(
                    "Cannot help use pesticide on your own tile"
                )
            }
            if (!placedItemTile.seedGrowthInfo) {
                throw new GrpcFailedPreconditionException("Tile is not planted")
            }
            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsInfested) {
                throw new GrpcFailedPreconditionException("Tile is not infested")
            }

            const {
                value: { helpUsePesticide: { energyConsume, experiencesGain } }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
                .session(mongoSession)
            //get user
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // substract energy
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

            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: neighborUserId
            })

            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
