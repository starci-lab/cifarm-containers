import { BullQueueData, BullQueueName } from "./bull.types"

export const bullData: Record<BullQueueName, BullQueueData>  = {
    [BullQueueName.Crop]: {
        name: "CROP_QUEUE",
        batchSize: 10000,
        prefix: "{crop}"

    },
    [BullQueueName.Animal]: {
        name: "ANIMAL_QUEUE",
        batchSize: 10000,
        prefix: "{animal}"
    },
    [BullQueueName.Delivery]: {
        name: "DELIVERY_QUEUE",
        batchSize: 1000,
        prefix: "{delivery}"
    },
    [BullQueueName.Energy]: {
        name: "ENERGY_QUEUE",
        batchSize: 10000,
        prefix: "{energy}"
    }
}
