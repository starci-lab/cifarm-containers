import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    Collection,
    CollectionEntity,
    CropCurrentState,
    CropGrowthLastSchedule,
    InjectPostgreSQL,
    SeedGrowthInfoEntity,
    SpeedUpData,
    TempEntity,
    TempId
} from "@src/databases"
import { LeaderElectionService } from "@src/leader-election"
import { BulkJobOptions, Queue } from "bullmq"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { CropJobData } from "./crop.dto"

dayjs.extend(utc)

@Injectable()
export class CropService {
    private readonly logger = new Logger(CropService.name)
    constructor(
        @InjectQueue(BullQueueName.Crop) private readonly cropQueue: Queue,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly leaderElectionService: LeaderElectionService
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
            // query crops that are not fully matured and do not need water
            //this.logger.fatal("Checking for crops that need to be grown")
            count = await queryRunner.manager.count(SeedGrowthInfoEntity, {
                where: {
                    //Not fully matured and need water
                    currentState:
                        Not(CropCurrentState.FullyMatured) && Not(CropCurrentState.NeedWater)
                }
            })
            const speedUps = await queryRunner.manager.find(CollectionEntity, {
                where: {
                    collection: Collection.CropSpeedUp
                }
            })
            
            //get the last scheduled time, get from db not cache
            const { value } = await queryRunner.manager.findOne(TempEntity, {
                where: {
                    id: TempId.CropGrowthLastSchedule
                }
            })
            const { date } = value as CropGrowthLastSchedule

            // this.logger.debug(`Found ${count} crops that need to be grown`)
            if (count === 0) {
                // this.logger.verbose("No crops to grow")
                return
            }

            //split into 10000 per batch
            const batchSize = bullData[BullQueueName.Crop].batchSize
            const batchCount = Math.ceil(count / batchSize)

            let time = date ? dayjs().utc().diff(date, "milliseconds") / 1000.0 : 1
            if (speedUps.length) {
                for (const { data } of speedUps) {
                    const { time: additionalTime } = data as SpeedUpData
                    time += Number(additionalTime)
                }
            }

            // Create batches
            const batches: Array<{
                name: string
                data: CropJobData,
                opts?: BulkJobOptions
            }> = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: Math.min((i + 1) * batchSize, count),
                    time,
                    utcTime: dayjs().utc().valueOf()
                },
                opts: bullData[BullQueueName.Crop].opts
            }))
            const jobs = await this.cropQueue.addBulk(batches)
            this.logger.verbose(`Added ${jobs.at(0).name} jobs to the crop queue. Time: ${time}`)

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(CollectionEntity, {
                    collection: Collection.CropSpeedUp
                })
                await queryRunner.manager.save(TempEntity, {
                    id: TempId.CropGrowthLastSchedule,
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
