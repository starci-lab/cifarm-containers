import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { EnergyRegen, InjectPostgreSQL, SystemEntity, SystemId, UserEntity } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Job } from "bullmq"
import { DataSource, LessThanOrEqual } from "typeorm"
import { getDifferenceAndValues } from "@src/common"

@Processor(bullData[BullQueueName.Energy].name)
export class EnergyWorker extends WorkerHost {
    private readonly logger = new Logger(EnergyWorker.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService
    ) {
        super()
    }

    public override async process(job: Job<EnergyJobData>): Promise<void> {
        const { time, skip, take, utcTime } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const users = await queryRunner.manager.find(UserEntity, {
                skip,
                take,
                where: {
                    energyFull: false,
                    createdAt: LessThanOrEqual(this.dateUtcService.getDayjs(utcTime).toDate())
                },
                order: {
                    createdAt: "ASC"
                }
            })

            const system = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.EnergyRegen
                }
            })
            const { time: energyRegenTime } = system.value as EnergyRegen // In Miniliseconds

            const promises: Array<Promise<void>> = []
            for (const user of users) {
                const promise = async () => {
                    const userChanges = () => {
                        const userBeforeChanges = { ...user }
                        // Add time to the user's energy
                        user.energyRegenTime += time
                        if (user.energyRegenTime >= energyRegenTime) {
                            user.energy += 1
                            // Reset the timer
                            user.energyRegenTime = 0
                        }
                        return getDifferenceAndValues(userBeforeChanges, user)
                    }
                    const changes = userChanges()
                    if (!changes) {
                        return
                    }
                    await queryRunner.startTransaction()
                    try {
                        await queryRunner.manager.update(UserEntity, user.id, changes)
                        await queryRunner.commitTransaction()
                    } catch (error) {
                        this.logger.error(`Transaction failed: ${error}`)
                        await queryRunner.rollbackTransaction()
                        throw error
                    }
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } finally {
            await queryRunner.release()
        }
    }
}
