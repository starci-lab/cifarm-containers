import { BullQueueData, BullQueueName } from "./bull.types"

export const bullData: Record<BullQueueName, BullQueueData>  = {
    [BullQueueName.Crop]: {
        name: "CROP_QUEUE",
        batchSize: 10000
    },
    [BullQueueName.Animal]: {
        name: "ANIMAL_QUEUE",
        batchSize: 10000
    },
    [BullQueueName.Delivery]: {
        name: "DELIVERY_QUEUE",
        batchSize: 1000
    }
}
