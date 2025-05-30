import { BullQueueData, BullQueueName } from "./bull.types"
import { formatWithBraces } from "./bull.utils"
import { envConfig } from "@src/env"
export const queueOptions = {
    COMPLETE_JOB_COUNT: 1000, // keep up to 1000 jobs
    FAILED_JOB_COUNT: 5000, // keep up to 1000 jobs
}

export const bullData: Record<BullQueueName, BullQueueData>  = {
    [BullQueueName.Plant]: {
        name: "PLANT_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("plant"),
        opts: {
            removeOnComplete: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    },
    [BullQueueName.Animal]: {
        name: "ANIMAL_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("animal"),
        opts: {
            removeOnComplete: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    },
    [BullQueueName.Delivery]: {
        name: "DELIVERY_QUEUE",
        batchSize: 1000,
        prefix: formatWithBraces("delivery"),
        opts: {
            removeOnComplete: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    },
    [BullQueueName.Energy]: {
        name: "ENERGY_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("energy"),
        opts: {
            removeOnComplete: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    },
    [BullQueueName.Fruit]: {
        name: "FRUIT_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("fruit"),
        opts: {
            removeOnComplete: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    },
    [BullQueueName.BeeHouse]: {
        name: "BEE_HOUSE_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("beehouse"),
        opts: {
            removeOnComplete: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: envConfig().cron.timeout / 1000,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    }
}


