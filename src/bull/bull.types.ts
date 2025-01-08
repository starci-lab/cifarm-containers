export enum BullQueueName {
    Crop = "crop",
    Animal = "animal",
    Delivery = "delivery",
    Energy = "energy"
}

export interface BullQueueData {
    name: string
    batchSize: number
    prefix?: string
}

export interface RegisterQueuesOptions {
    queueNames?: BullQueueName | Array<BullQueueName>
    isGlobal?: boolean
}
