import { BullModule } from "@nestjs/bullmq"
import { bullConfig, BullQueueName, envConfig } from "@src/config"

export const bullForRoot = () => {
    return BullModule.forRoot({
        connection: {
            host: envConfig().database.redis.job.host,
            port: envConfig().database.redis.job.port
        }
    })
}

export const bullRegisterQueue = (queueName: BullQueueName) => {
    return BullModule.registerQueue({
        name: bullConfig[queueName].name
    })
}