import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    InjectPostgreSQL,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { UsePesticideRequest, UsePesticideResponse } from "./use-pesticide.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class UsePesticideService {
    private readonly logger = new Logger(UsePesticideService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
    }

    async usePesticide(request: UsePesticideRequest): Promise<UsePesticideResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { 
                    userId: request.userId,
                    id: request.placedItemTileId 
                },
                relations: {
                    seedGrowthInfo: true
                }
            })

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")

            if (!placedItemTile.seedGrowthInfo)
                throw new GrpcFailedPreconditionException("Tile is not planted")

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsInfested)
                throw new GrpcFailedPreconditionException("Tile is not infested")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                helpUsePesticide: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
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
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update seed growth info
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
            return {}
        }
        finally {
            await queryRunner.release()
        }
    }
}
