import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { EnergyRegen, InjectMongoose, KeyValueRecord, SystemId, SystemSchema, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Job } from "bullmq"
import { createObjectId } from "@src/common"
import { Connection } from "mongoose"
import { EnergyService } from "@src/gameplay"

@Processor(bullData[BullQueueName.Energy].name)
export class EnergyWorker extends WorkerHost {
    private readonly logger = new Logger(EnergyWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly energyService: EnergyService
    ) {
        super()
    }

    public override async process(job: Job<EnergyJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data

        const users = await this.connection
            .model<UserSchema>(UserSchema.name)
            .find({
                energyFull: false,
                createdAt: {
                    $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                }
            })
            .skip(skip)
            .limit(take)
            .sort({ createdAt: "desc" })

        const { value: { time: energyRegenTime } } = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<EnergyRegen>>(createObjectId(SystemId.EnergyRegen))

        const promises: Array<Promise<void>> = []
        for (const user of users) {
            const promise = async () => {
                const session = await this.connection.startSession()
                session.startTransaction()
                try {
                    const updateUser = () => {
                        // skip if the user's energy is full
                        if (user.energyFull) {
                            return
                        }
                        // Add time to the user's energy
                        user.energyRegenTime += time
                        if (user.energyRegenTime >= energyRegenTime) {
                            user.energy += 1
                            // Reset the timer
                            user.energyRegenTime = 0
                            // Check if the user's energy is full
                            user.energyFull = user.energy >= this.energyService.getMaxEnergy(user.level)
                        }
                    }
                    updateUser()
                    await user.save({ session })
                    await session.commitTransaction()
                } catch (error) {
                    this.logger.error(error)
                    await session.abortTransaction()
                } finally {
                    await session.endSession()
                }
            }
            promises.push(promise())
        }
        await Promise.all(promises)
    }
}
