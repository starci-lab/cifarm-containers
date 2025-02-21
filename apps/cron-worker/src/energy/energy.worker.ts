import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { EnergyRegen, InjectMongoose, KeyValueRecord, SystemId, SystemSchema, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Job } from "bullmq"
import { createObjectId } from "@src/common"
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
        this.logger.verbose(`Processing job: ${job.id}`)
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
                .sort({ createdAt: "desc" })
                .session(mongoSession)
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
                            // Add time to the user's energy
                            user.energyRegenTime += time
                            if (user.energyRegenTime >= energyRegenTime) {
                                user.energy += 1
                                // Reset the timer
                                user.energyRegenTime = 0
                            }
                            return
                        }
                        updateUser()
                        await user.save({ session })
                        session.commitTransaction()
                    } catch (error) {
                        this.logger.error(error)
                        session.abortTransaction()
                        throw error
                    } finally {
                        session.endSession()
                    }
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
