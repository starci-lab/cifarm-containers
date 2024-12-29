export enum BullQueueName {
    Crop = "crop",
    Animal = "animal",
    Delivery = "delivery"
}

export interface BullQueueData {
    name: string
    batchSize: number
}

export interface BullRegisterOptions {
    queueName: BullQueueName
}