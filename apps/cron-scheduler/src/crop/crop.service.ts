import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { Collection, CollectionEntity, CropCurrentState, SeedGrowthInfoEntity, SpeedUpData } from "@src/database"
import { CropJobData } from "./crop.dto"
import { bullConfig, BullQueueName } from "@src/config"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

@Injectable()
export class CropService {
    private readonly logger = new Logger(CropService.name)
    constructor(
        @InjectQueue(bullConfig[BullQueueName.Crop].name) private cropQueue: Queue,
        private readonly dataSource: DataSource
    ) {}
    
    @Cron("*/1 * * * * *")
    async handle() {
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            // query crops that are not fully matured and do not need water
            this.logger.fatal("Checking for crops that need to be grown")
            count = await queryRunner.manager.count(SeedGrowthInfoEntity, {
                where: {
                    fullyMatured: false,
                    currentState: Not(CropCurrentState.NeedWater),
                }
            })
            const speedUps = await queryRunner.manager.find(CollectionEntity, {
                where: {
                    collection: Collection.CropSpeedUp
                }
            })
        
            this.logger.debug(`Found ${count} crops that need to be grown`)
            if (count === 0) {
                this.logger.verbose("No crops to grow")
                return
            }

            //split into 10000 per batch
            const batchSize = bullConfig[BullQueueName.Crop].batchSize
            const batchCount = Math.ceil(count / batchSize)

            let growthTime = 1
            if (speedUps.length) {
                for (const { data } of speedUps)
                {
                    const { time : additionalTime } = data as SpeedUpData
                    console.log(additionalTime)
                    growthTime += Number(additionalTime)
                }
            }

            // Create batches
            const batches: Array<{
            name: string
            data: CropJobData
        }> = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                skip: i * batchSize,
                take: Math.min((i + 1) * batchSize, count),
                growthTime,
                utcTime: dayjs().utc().valueOf()
            }
        }))
            this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            const jobs = await this.cropQueue.addBulk(batches)
            this.logger.verbose(`Added ${jobs.at(0).name} jobs to the queue`)

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(CollectionEntity, {
                    collection: Collection.CropSpeedUp
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
