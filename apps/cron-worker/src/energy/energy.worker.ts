import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { InjectMongoose, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Job } from "bullmq"
import { Connection } from "mongoose"
import { EnergyService, StaticService, SyncService } from "@src/gameplay"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"
import { envConfig } from "@src/env"
@Processor(bullData[BullQueueName.Energy].name)
export class EnergyWorker extends WorkerHost {
    private readonly logger = new Logger(EnergyWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        private readonly syncService: SyncService,
        private readonly dateUtcService: DateUtcService,
        private readonly energyService: EnergyService,
        private readonly staticService: StaticService,
    ) {
        super()
    }

    public override async process(job: Job<EnergyJobData>): Promise<void> {
        if ((Date.now() - job.timestamp) > envConfig().cron.timeout) {
            this.logger.warn(`Removed old job: ${job.id}`)
            return
        }  
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

        const { time: energyRegenTime } = this.staticService.energyRegen
        const promises: Array<Promise<void>> = []
        for (const user of users) {
            const promise = async () => {
                const session = await this.connection.startSession()
                await session.withTransaction(async () => {
                    const updateUser = () => {
                    // skip if the user's energy is full
                        if (user.energyFull) {
                            return false
                        }
                        // Add time to the user's energy
                        user.energyRegenTime += time
                        if (user.energyRegenTime >= energyRegenTime) {
                        //console.log("Energy regen time", user.energyRegenTime)
                            user.energy += 1
                            // Reset the timer
                            user.energyRegenTime = 0
                            // Check if the user's energy is full
                            user.energyFull = user.energy >= this.energyService.getMaxEnergy(user.level)
                            return true 
                        }
                        return false
                    }
                    const userSnapshot = user.$clone()
                    const synced = updateUser()
                    await user.save()
                    if (synced) {
                        const data = this.syncService.getPartialUpdatedSyncedUser({
                            userSnapshot,
                            userUpdated: user
                        })
                        await this.kafkaProducer.send({
                            topic: KafkaTopic.SyncUser,
                            messages: [
                                { value: JSON.stringify({
                                    userId: user.id,
                                    data
                                }) }
                            ]
                        })
                    }
                })
            }
            promises.push(promise())
        }
        await Promise.all(promises)
    }
}
