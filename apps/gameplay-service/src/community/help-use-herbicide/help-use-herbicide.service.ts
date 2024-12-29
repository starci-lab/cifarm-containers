import { Injectable, Logger } from "@nestjs/common"
import {
    HelpUseHerbicideTransactionFailedException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotNeedUseHerbicideException,
    PlacedItemTileNotPlantedException,
} from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    Activities,
    CropCurrentState,
    GameplayPostgreSQLService,
    PlacedItemEntity,
    PlacedItemType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { HelpUseHerbicideRequest, HelpUseHerbicideResponse } from "./help-use-herbicide.dto"
import { KafkaClientService, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class HelpUseHerbicideService {
    private readonly logger = new Logger(HelpUseHerbicideService.name)

    private readonly dataSource: DataSource
    private readonly clientKafka: ClientKafka
    constructor(
        private readonly kafkaClientService: KafkaClientService,
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
        this.clientKafka = this.kafkaClientService.getClient()
    }

    async helpUseHerbicide(request: HelpUseHerbicideRequest): Promise<HelpUseHerbicideResponse> {
        this.logger.debug(`Help use herbicide for user ${request.neighborUserId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // get placed item
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
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
                throw new PlacedItemTileNotFoundException(request.placedItemTileId)
            }

            if (!placedItemTile.seedGrowthInfo) {
                throw new PlacedItemTileNotPlantedException(request.placedItemTileId)
            }

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy) {
                throw new PlacedItemTileNotNeedUseHerbicideException(request.placedItemTileId)
            }

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                helpWater: { energyConsume, experiencesGain }
            } = value as Activities
            
            //get user
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
                this.logger.error(`Help use herbicide failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new HelpUseHerbicideTransactionFailedException(error)
            } 

            this.clientKafka.emit(
                KafkaPattern.PlacedItemsBroadcast,
                {
                    userId: request.neighborUserId
                })

            return {}
        } finally {
            await queryRunner.release()
        }   
    }
}
