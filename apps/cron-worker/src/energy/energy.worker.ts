import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import {
    EnergyRegenTime,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergysWorkerProcessTransactionFailedException } from "@src/exceptions"
import { EnergyService } from "@src/gameplay"
import { Job } from "bullmq"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { DataSource } from "typeorm"
dayjs.extend(utc)

@Processor(bullData[BullQueueName.Energy].name)
export class EnergyWorker extends WorkerHost {
    private readonly logger = new Logger(EnergyWorker.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly energySerice: EnergyService
    ) {
        super()
    }

    public override async process(job: Job<EnergyJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let users = await queryRunner.manager.find(UserEntity, {
                skip,
                take,
                order: {
                    createdAt: "ASC"
                }
            })

            const system = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.EnergyRegenTime
                }
            })
            const { time: energyRegenTime } = system.value as EnergyRegenTime // In Miniliseconds

            users = users.map((user) => {
                // Check if user's energy is full
                if (user.energy >= this.energySerice.getMaxEnergy(user.level)) return user

                // Add time to the user's energy
                user.energyRegenTime += time
                if (user.energyRegenTime >= energyRegenTime) {
                    user.energy += 1
                    user.energyRegenTime -= energyRegenTime
                }
                return user
            })

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(UserEntity, users)
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new EnergysWorkerProcessTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
