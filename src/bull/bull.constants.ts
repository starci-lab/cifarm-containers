import { BullQueueData, BullQueueName } from "./bull.types"
import { formatWithBraces } from "./bull.utils"

export const queueOptions = {
    JOB_AGE: 24 * 3600, // 24 hours
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
                age: queueOptions.JOB_AGE,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: queueOptions.JOB_AGE,
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
                age: queueOptions.JOB_AGE,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: queueOptions.JOB_AGE,
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
                age: queueOptions.JOB_AGE,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: queueOptions.JOB_AGE,
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
                age: queueOptions.JOB_AGE,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: queueOptions.JOB_AGE,
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
                age: queueOptions.JOB_AGE,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: queueOptions.JOB_AGE,
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
                age: queueOptions.JOB_AGE,
                count: queueOptions.COMPLETE_JOB_COUNT
            },
            removeOnFail: {
                age: queueOptions.JOB_AGE,
                count: queueOptions.FAILED_JOB_COUNT
            },
        }
    }
}


