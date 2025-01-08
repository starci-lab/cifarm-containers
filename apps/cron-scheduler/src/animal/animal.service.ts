import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, BullService } from "@src/bull"
import { AnimalCurrentState, AnimalGrowthLastSchedule, AnimalInfoEntity, Collection, CollectionEntity, GameplayPostgreSQLService, SpeedUpData, TempEntity, TempId } from "@src/databases"
import { LeaderElectionService } from "@src/leader-election"
import { Queue } from "bullmq"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { AnimalJobData } from "./animal.dto"
dayjs.extend(utc)

@Injectable()
export class AnimalService {
    private readonly logger = new Logger(AnimalService.name)
    private readonly dataSource: DataSource
    private readonly animalQueue: Queue
    constructor(
        private readonly bullService: BullService,
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly leaderElectionService: LeaderElectionService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
        this.animalQueue = this.bullService.getQueue()
    }

    @Cron("*/1 * * * * *")
    async handle() {
        if (!this.leaderElectionService.isLeaderInstance()) return

        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            count = await queryRunner.manager.count(AnimalInfoEntity, {
                where: {
                    currentState: Not(AnimalCurrentState.Hungry) && Not(AnimalCurrentState.Yield)
                }
            })

            const speedUps = await queryRunner.manager.find(CollectionEntity, {
                where: {
                    collection: Collection.AnimalSpeedUp
                }
            })
            //get the last scheduled time
            const { value } = await queryRunner.manager.findOne(TempEntity, {
                where: {
                    id: TempId.AnimalGrowthLastSchedule
                },
            })
            const { date } = value as AnimalGrowthLastSchedule

            //date is 1 second ago

            // this.logger.debug(`Found ${count} animals that need to be grown`)
            if (count === 0) {
                // this.logger.verbose("No animals to grow")
                return
            }
            
            //split into 10000 per batch
            const batchSize = bullData[BullQueueName.Crop].batchSize
            const batchCount = Math.ceil(count / batchSize)
            
            let time = date ? dayjs().utc().diff(date, "milliseconds") / 1000.0 : 1
            if (speedUps.length) {
                for (const { data } of speedUps)
                {
                    const { time : additionalTime } = data as SpeedUpData
                    time += Number(additionalTime)
                }
            }
            
            // Create batches
            const batches: Array<{
                        name: string
                        data: AnimalJobData
                    }> = Array.from({ length: batchCount }, (_, i) => ({
                        name: v4(),
                        data: {
                            skip: i * batchSize,
                            take: Math.min((i + 1) * batchSize, count),
                            time,
                            utcTime: dayjs().utc().valueOf()
                        }
                    }))
            //this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            const jobs = await this.animalQueue.addBulk(batches)
            this.logger.verbose(`Added ${jobs.at(0).name} jobs to the animal queue. Time: ${time}`)
            
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(CollectionEntity, {
                    collection: Collection.AnimalSpeedUp
                })
                await queryRunner.manager.save(TempEntity, {
                    id: TempId.AnimalGrowthLastSchedule,
                    value: {
                        date: dayjs().utc().toDate()
                    }
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Error deleting speed up collection: ${error}`)
                await queryRunner.rollbackTransaction()
                throw error
            }

        } 
        finally {
            await queryRunner.release()
        }
    }
}
