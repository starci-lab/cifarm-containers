import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { EnergyRegen, InjectMongoose, KeyValueRecord, SystemId, SystemSchema, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Job } from "bullmq"
import { getDifferenceAndValues } from "@src/common"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Energy].name)
export class EnergyWorker extends WorkerHost {
    private readonly logger = new Logger(EnergyWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService
    ) {
        super()
    }

    public override async process(job: Job<EnergyJobData>): Promise<void> {
        const { time, skip, take, utcTime } = job.data

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
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
                .session(mongoSession)

            const { value: { time: energyRegenTime } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<EnergyRegen>>(SystemId.EnergyRegen)

            const promises: Array<Promise<void>> = []
            for (const user of users) {
                const promise = async () => {
                    mongoSession.startTransaction()
                    try {
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
                        await user.save()
                        mongoSession.commitTransaction()
                    } catch (error) {
                        this.logger.error(error)
                        mongoSession.abortTransaction()
                        throw error
                    }
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } finally {
            await mongoSession.endSession()
        }
    }
}
