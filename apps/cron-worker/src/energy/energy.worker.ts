import { EnergyJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { InjectMongoose, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { Job } from "bullmq"
import { Connection } from "mongoose"
import { EnergyService, StaticService } from "@src/gameplay"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { SyncUserPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Processor(bullData[BullQueueName.Energy].name)
export class EnergyWorker extends WorkerHost {
    private readonly logger = new Logger(EnergyWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        private readonly dateUtcService: DateUtcService,
        private readonly energyService: EnergyService,
        private readonly staticService: StaticService,
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

        const { time: energyRegenTime } = this.staticService.energyRegen
        const promises: Array<Promise<void>> = []
        for (const user of users) {
            const promise = async () => {
                const mongoSession = await this.connection.startSession()
                try {
                    let emit = false
                    const updateUser = () => {
                        // skip if the user's energy is full
                        if (user.energyFull) {
                            return
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
                            emit = true
                        }
                    }
                    updateUser()
                    await user.save({ session: mongoSession })
                    if (emit) {
                        const payload: SyncUserPayload = {
                            user: user.toJSON(),
                        }
                        await this.kafkaProducer.send({
                            topic: KafkaTopic.SyncUser,
                            messages: [
                                { value: JSON.stringify(payload) }
                            ]
                        })
                    }
                } catch (error) {
                    this.logger.error(error)
                } finally {
                    await mongoSession.endSession()
                }
            }
            promises.push(promise())
        }
        await Promise.all(promises)
    }
}
