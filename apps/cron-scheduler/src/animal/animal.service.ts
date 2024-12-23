import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { AnimalCurrentState, AnimalGrowthLastSchedule, AnimalInfoEntity, Collection, CollectionEntity, SpeedUpData, TempEntity, TempId } from "@src/database"
import { AnimalJobData } from "./animal.dto"
import { bullConfig, BullQueueName } from "@src/config"
import { LeaderElectionService } from "@src/services"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

@Injectable()
export class AnimalService {
    private readonly logger = new Logger(AnimalService.name)
    constructor(
        @InjectQueue(bullConfig[BullQueueName.Animal].name) private animalQueue: Queue,
        private readonly dataSource: DataSource,
        private readonly leaderElectionService: LeaderElectionService,
    ) {}

    @Cron("*/1 * * * * *")
    async handle() {
        if (!this.leaderElectionService.isLeaderInstance()) return
        this.logger.verbose("Checking for animals that need to be grown")

        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            count = await queryRunner.manager.count(AnimalInfoEntity, {
                where: {
                    hasYielded: false,
                    currentState: Not(AnimalCurrentState.Hungry)
                }
            })

            const speedUps = await queryRunner.manager.find(CollectionEntity, {
                where: {
                    collection: Collection.AnimalSpeedUp
                }
            })
            //get the last scheduled time
            // const value = await queryRunner.manager.findOne(TempEntity, {
            //     where: {
            //         id: TempId.CropGrowthLastSchedule
            //     }
            // })
            
            //today - 1 second
            const value = {
                date: dayjs().utc().subtract(1, "second").toDate()
            }
            
            const { date } = value as AnimalGrowthLastSchedule
            this.logger.debug(`Found ${count} animals that need to be grown`)
            if (count === 0) {
                this.logger.verbose("No animals to grow")
                return
            }
            
            //split into 10000 per batch
            const batchSize = bullConfig[BullQueueName.Crop].batchSize
            const batchCount = Math.ceil(count / batchSize)
            
            let growthTime = date ? dayjs().utc().diff(date, "milliseconds") / 1000.0 : 1
            if (speedUps.length) {
                for (const { data } of speedUps)
                {
                    const { time : additionalTime } = data as SpeedUpData
                    growthTime += Number(additionalTime)
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
                            growthTime,
                            utcTime: dayjs().utc().valueOf()
                        }
                    }))
            //this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            const jobs = await this.animalQueue.addBulk(batches)
            this.logger.verbose(`Added ${jobs.at(0).name} jobs to the queue`)
            
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

        } finally {
            await queryRunner.release()
        }
    }
}
