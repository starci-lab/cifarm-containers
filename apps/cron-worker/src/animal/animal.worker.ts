import { AnimalJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import {
    AnimalCurrentState,
    AnimalInfoEntity,
    AnimalRandomness,
    InjectPostgreSQL,
    SystemEntity,
    SystemId
} from "@src/databases"
import { DateUtcService } from "@src/date"
import { ProductionService } from "@src/gameplay"
import { Job } from "bullmq"
import { DataSource, LessThanOrEqual, Not } from "typeorm"

@Processor(bullData[BullQueueName.Animal].name)
export class AnimalWorker extends WorkerHost {
    private readonly logger = new Logger(AnimalWorker.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService,
        private readonly productionService: ProductionService
    ) {
        super()
    }

    public override async process(job: Job<AnimalJobData>): Promise<void> {
        const { time, skip, take, utcTime } = job.data
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let animalInfos = await queryRunner.manager.find(AnimalInfoEntity, {
                where: {
                    currentState: Not(AnimalCurrentState.Hungry) && Not(AnimalCurrentState.Yield),
                    createdAt: LessThanOrEqual(this.dateUtcService.getDayjs(utcTime).toDate())
                },
                relations: {
                    placedItem: {
                        placedItemType: {
                            animal: true
                        }
                    }
                },
                skip,
                take,
                order: {
                    createdAt: "ASC"
                }
            })

            const system = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.AnimalRandomness
                }
            })
            const { sickChance } = system.value as AnimalRandomness
            animalInfos = animalInfos.map((animalInfo) => {
                if (animalInfo.isAdult) {      
                    // If animal is adult, add time to the animal yield
                    animalInfo.currentYieldTime += time
                    // if animal grow to half of the yield time, it may get sick and immunized
                    if (
                        !animalInfo.immunized
                        && animalInfo.currentYieldTime >= Math.floor(animalInfo.placedItem.placedItemType.animal.yieldTime / 2)) {
                        if (Math.random() < sickChance) {
                            animalInfo.currentState = AnimalCurrentState.Sick
                        }
                        animalInfo.immunized = true
                    // if animal yield time is more than or equal the yield time, it will yield
                    }
                    if (
                        animalInfo.currentYieldTime >=
                        animalInfo.placedItem.placedItemType.animal.yieldTime
                    ) {
                        animalInfo.currentYieldTime = 0
                        //if sick, the harvest quantity is the average of min and max harvest quantity
                        if (animalInfo.currentState === AnimalCurrentState.Sick) {
                            animalInfo.harvestQuantityRemaining =
                                (animalInfo.placedItem.placedItemType.animal.minHarvestQuantity +
                                    animalInfo.placedItem.placedItemType.animal
                                        .maxHarvestQuantity) /
                                2
                        } else {
                            // if not sick, the harvest quantity is the max harvest quantity
                            animalInfo.harvestQuantityRemaining =
                                animalInfo.placedItem.placedItemType.animal.maxHarvestQuantity
                        }
                        animalInfo.currentState = AnimalCurrentState.Yield
                    }
                    return animalInfo
                } 
                
                // Not adult state

                // Add time to the animal growth and hunger
                animalInfo.currentGrowthTime += time
                animalInfo.currentHungryTime += time

                // check if animal is enough to be adult
                if (animalInfo.currentGrowthTime >= animalInfo.placedItem.placedItemType.animal.growthTime) {
                    animalInfo.isAdult = true
                    animalInfo.currentState = AnimalCurrentState.Hungry
                    return animalInfo
                }

                // check if animal is hungry
                if (
                    animalInfo.currentHungryTime >=
                        animalInfo.placedItem.placedItemType.animal.hungerTime
                ) {
                    animalInfo.currentState = AnimalCurrentState.Hungry
                    return animalInfo
                }

                const chance = this.productionService.computeTileQualityChance({
                    entity: animalInfo.placedItem.tileInfo,
                    qualityProductChanceLimit: animalInfo.placedItem.placedItemType.tile.qualityProductChanceLimit,
                    qualityProductChanceStack: animalInfo.placedItem.placedItemType.tile.qualityProductChanceStack
                })

                if (Math.random() < chance) {
                    animalInfo.isQuality = true
                }
                
                return animalInfo
            })

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(AnimalInfoEntity, animalInfos)
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw error
            }
        } catch (error) {
            this.logger.error(`Error processing animal job: ${error}`)
            throw error
        } finally {
            await queryRunner.release()
        }
    }
}
