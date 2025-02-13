import { Injectable, Logger } from "@nestjs/common"
import { UseHerbicideRequest, UseHerbicideResponse } from "./use-herbicide.dto"

@Injectable()
export class UseHerbicideService {
    private readonly logger = new Logger(UseHerbicideService.name)

    constructor(
        // @InjectPostgreSQL()
        // private readonly dataSource: DataSource,
        // private readonly energyService: EnergyService,
        // private readonly levelService: LevelService,
        // @InjectKafka()
        // private readonly clientKafka: ClientKafka
    ) {
    }

    async useHerbicide(request: UseHerbicideRequest): Promise<UseHerbicideResponse> {
        // const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()
        // try {
        //     const placedItemTile = await queryRunner.manager.findOne(PlacedItemSchema, {
        //         where: { 
        //             userId: request.userId,
        //             id: request.placedItemTileId  
        //         },
        //         relations: {
        //             seedGrowthInfo: true
        //         }
        //     })

        //     if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")

        //     if (!placedItemTile.seedGrowthInfo)
        //         throw new GrpcFailedPreconditionException("Tile is not planted")

        //     if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy)
        //         throw new GrpcFailedPreconditionException("Tile is not weedy")

        //     const { value } = await queryRunner.manager.findOne(SystemEntity, {
        //         where: { id: SystemId.Activities }
        //     })
        //     const {
        //         usePesticide: { energyConsume, experiencesGain }
        //     } = value as Activities

        //     const user = await queryRunner.manager.findOne(UserSchema, {
        //         where: { id: request.userId }
        //     })

        //     this.energyService.checkSufficient({
        //         current: user.energy,
        //         required: energyConsume
        //     })

        //     const energyChanges = this.energyService.substract({
        //         entity: user,
        //         energy: energyConsume
        //     })
        //     const experiencesChanges = this.levelService.addExperiences({
        //         entity: user,
        //         experiences: experiencesGain
        //     })

        //     await queryRunner.startTransaction()
        //     // substract energy
        //     try {
        //     // update user
        //         await queryRunner.manager.update(UserSchema, user.id, {
        //             ...energyChanges,
        //             ...experiencesChanges
        //         })

        //         // update seed growth info
        //         await queryRunner.manager.update(
        //             SeedGrowthInfoEntity,
        //             placedItemTile.seedGrowthInfo.id,
        //             {
        //                 currentState: CropCurrentState.Normal
        //             }
        //         )
        //         await queryRunner.commitTransaction()
        //     } catch (error) {
        //         const errorMessage = `Transaction failed, reason: ${error.message}`
        //         this.logger.error(errorMessage)
        //         await queryRunner.rollbackTransaction()
        //         throw new GrpcInternalException(errorMessage)
        //     }

        //     // Publish event
        //     this.clientKafka.emit(KafkaPattern.PlacedItems, {
        //         userId: user.id
        //     })
                        
        //     return {}
        // } finally {
        //     await queryRunner.release()
        // }

        return {}
    }
}
