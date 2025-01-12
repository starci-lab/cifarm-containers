import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName } from "@src/bull"
import { Collection, CollectionEntity, EnergyGrowthLastSchedule, InjectPostgreSQL, SpeedUpData, TempEntity, TempId, UserEntity } from "@src/databases"
import { LeaderElectionService } from "@src/leader-election"
import { BulkJobOptions, Queue } from "bullmq"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { EnergyJobData } from "./energy.dto"
dayjs.extend(utc)

@Injectable()
export class EnergyService {
    private readonly logger = new Logger(EnergyService.name)
    
    constructor(
        @InjectQueue(bullData[BullQueueName.Energy].name) private readonly EnergyQueue: Queue,
        private readonly leaderElectionService: LeaderElectionService,
        
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {
    }
    
    @Cron("*/1 * * * * *")
    async handle() {
        if (!this.leaderElectionService.isLeaderInstance()) return
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            count = await queryRunner.manager.count(UserEntity)
            const speedUps = await queryRunner.manager.find(CollectionEntity, {
                where: {
                    collection: Collection.EnergySpeedUp
                }
            })
            
            //get the last scheduled time
            const { value } = await queryRunner.manager.findOne(TempEntity, {
                where: {
                    id: TempId.EnergyRegenerationLastSchedule
                },
            })
            const { date } = value as EnergyGrowthLastSchedule

            // this.logger.debug(`Check ${count} user's energy`)
            if (count === 0) {
                this.logger.verbose("No user's energy to check")
                return
            }

            //split into 10000 per batch
            const batchSize = bullData[BullQueueName.Energy].batchSize
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
            data: EnergyJobData,
            opts?: BulkJobOptions
        }> = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                skip: i * batchSize,
                take: Math.min((i + 1) * batchSize, count),
                time,
                utcTime: dayjs().utc().valueOf()
            },
            opts: bullData[BullQueueName.Energy].opts
        }))
            //this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            const jobs = await this.EnergyQueue.addBulk(batches)
            this.logger.verbose(`Added ${jobs.at(0).name} jobs to the regen energy queue. Time: ${time}`)

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(CollectionEntity, {
                    collection: Collection.EnergySpeedUp
                })

                await queryRunner.manager.save(TempEntity, {
                    id: TempId.EnergyRegenerationLastSchedule,
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