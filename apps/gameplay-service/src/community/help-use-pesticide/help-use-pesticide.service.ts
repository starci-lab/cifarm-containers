import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import {
    Activities,
    CropCurrentState,
    InjectPostgreSQL,
    PlacedItemSchema,
    PlacedItemType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { HelpUsePesticideRequest, HelpUsePesticideResponse } from "./help-use-pesticide.dto"
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class HelpUsePesticideService {
    private readonly logger = new Logger(HelpUsePesticideService.name)
    constructor(
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpUsePesticide(request: HelpUsePesticideRequest): Promise<HelpUsePesticideResponse> {
        if (request.userId === request.neighborUserId) {
            throw new GrpcInvalidArgumentException("Cannot help use pesticide yourself")
        }
        
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // get placed item
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemSchema, {
                where: {
                    userId: request.neighborUserId,
                    id: request.placedItemTileId,
                    placedItemType: {
                        type: PlacedItemType.Tile
                    }
                },
                relations: {
                    seedGrowthInfo: true,
                    placedItemType: true
                }
            })

            if (!placedItemTile) {
                throw new GrpcNotFoundException("Tile not found")
            }

            if (!placedItemTile.seedGrowthInfo) {
                throw new GrpcFailedPreconditionException("Tile is not planted")
            }

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsInfested) {
                throw new GrpcFailedPreconditionException("Tile is not infested")
            }

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                helpWater: { energyConsume, experiencesGain }
            } = value as Activities

            //get user
            const user = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // substract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })

            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })

            await queryRunner.startTransaction()
            try {
                // update user
                await queryRunner.manager.update(UserSchema, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update crop info
                await queryRunner.manager.update(
                    SeedGrowthInfoEntity,
                    placedItemTile.seedGrowthInfo.id,
                    {
                        currentState: CropCurrentState.Normal
                    }
                )

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: request.neighborUserId
            })

            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
