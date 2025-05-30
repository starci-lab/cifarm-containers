import { BulkJobOptions } from "bullmq"

export enum BullQueueName {
    Animal = "animal",
    Delivery = "delivery",
    Energy = "energy",
    Fruit = "fruit",
    BeeHouse = "beeHouse",
    Plant = "plant",
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

export type WithPing<T> = Partial<T> & {
    ping?: boolean
}
