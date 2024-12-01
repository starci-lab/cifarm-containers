export enum BullQueueName {
    Crop = "crop",
    Animal = "animal",
    Delivery = "delivery"
}

export interface BullQueueDetails {
    name: string
}

export const bullConfig = {
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
