import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    AnimalCurrentState,
    AnimalGrowthLastSchedule,
    AnimalInfoEntity,
    Collection,
    CollectionEntity,
    InjectPostgreSQL,
    SpeedUpData,
    TempEntity,
    TempId
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { AnimalJobData } from "./animal.dto"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { DateUtcService } from "@src/date"

@Injectable()
export class AnimalService {
    private readonly logger = new Logger(AnimalService.name)
    constructor(
        @InjectQueue(BullQueueName.Animal) private readonly animalQueue: Queue,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService,
    ) {}

    // Flag to determine if the current instance is the leader
    private isLeader = false

    @OnEventLeaderElected()
    handleLeaderElected() {
        this.isLeader = true
    }

    @OnEventLeaderLost()
    handleLeaderLost() {
        this.isLeader = false
    }

    @Cron("*/1 * * * * *")
    async handle() {
        if (!this.isLeader) {
            return
        }

        const utcNow = this.dateUtcService.getDayjs()
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
                }
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

            let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1
            if (speedUps.length) {
                for (const { data } of speedUps) {
                    const { time: additionalTime } = data as SpeedUpData
                    time += Number(additionalTime)
                }
            }

            // Create batches
            const batches: Array<{
                name: string
                data: AnimalJobData
                opts?: BulkJobOptions
            }> = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: Math.min((i + 1) * batchSize, count),
                    time,
                    utcTime: utcNow.valueOf()
                },
                opts: bullData[BullQueueName.Animal].opts
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
                        date: utcNow.toDate()
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
