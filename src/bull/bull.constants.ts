import { BullQueueData, BullQueueName } from "./bull.types"
import { formatWithBraces } from "./bull.utils"

export const bullData: Record<BullQueueName, BullQueueData>  = {
    [BullQueueName.Crop]: {
        name: "CROP_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("crop")

    },
    [BullQueueName.Animal]: {
        name: "ANIMAL_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("animal")
    },
    [BullQueueName.Delivery]: {
        name: "DELIVERY_QUEUE",
        batchSize: 1000,
        prefix: formatWithBraces("delivery")
    },
    [BullQueueName.Energy]: {
        name: "ENERGY_QUEUE",
        batchSize: 10000,
        prefix: formatWithBraces("energy")
    }
}