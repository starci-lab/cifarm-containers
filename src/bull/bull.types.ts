import { BulkJobOptions } from "bullmq"

export enum BullQueueName {
    Crop = "crop",
    Animal = "animal",
    Delivery = "delivery",
    Energy = "energy",
    Fruit = "fruit",
}

export interface BullQueueData {
    name: string
    batchSize: number
    prefix?: string
    opts?: BulkJobOptions
}

export interface RegisterQueueOptions {
    queueName?: BullQueueName
    isGlobal?: boolean
}
