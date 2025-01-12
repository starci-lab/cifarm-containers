import { BullQueueData, BullQueueName } from "./bull.types"
import { formatWithBraces } from "./bull.utils"

export const queueOptions = {
    REMOVE_ON_COMPLETE_AGE: 3600, // keep up to 1 hour
    REMOVE_ON_COMPLETE_COUNT: 1000, // keep up to 1000 jobs
    REMOVE_ON_FAIL_AGE: 24 * 3600, // keep up to 24 hours
}

export const bullData: Record<BullQueueName, BullQueueData>  = {
    [BullQueueName.Crop]: {
        name: "CROP_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("crop"),
        opts: {
            removeOnComplete: {
                age: queueOptions.REMOVE_ON_COMPLETE_AGE,
                count: queueOptions.REMOVE_ON_COMPLETE_COUNT
            },
            removeOnFail: {
                age: queueOptions.REMOVE_ON_FAIL_AGE
            },
        }
    },
    [BullQueueName.Animal]: {
        name: "ANIMAL_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("animal"),
        opts: {
            removeOnComplete: {
                age: queueOptions.REMOVE_ON_COMPLETE_AGE,
                count: queueOptions.REMOVE_ON_COMPLETE_COUNT
            },
            removeOnFail: {
                age: queueOptions.REMOVE_ON_FAIL_AGE
            },
        }
    },
    [BullQueueName.Delivery]: {
        name: "DELIVERY_QUEUE",
        batchSize: 1000,
        prefix: formatWithBraces("delivery"),
        opts: {
            removeOnComplete: {
                age: queueOptions.REMOVE_ON_COMPLETE_AGE,
                count: queueOptions.REMOVE_ON_COMPLETE_COUNT
            },
            removeOnFail: {
                age: queueOptions.REMOVE_ON_FAIL_AGE
            },
        }
    },
    [BullQueueName.Energy]: {
        name: "ENERGY_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("energy"),
        opts: {
            removeOnComplete: {
                age: queueOptions.REMOVE_ON_COMPLETE_AGE,
                count: queueOptions.REMOVE_ON_COMPLETE_COUNT
            },
            removeOnFail: {
                age: queueOptions.REMOVE_ON_FAIL_AGE
            },
        }
    }
}


