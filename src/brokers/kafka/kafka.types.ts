export interface KafkaOptions {
    groupId?: KafkaGroupId
    producerOnly?: boolean
}

export enum KafkaGroupId {
    PlacedItemsBroadcast = "placed-items-broadcast",
}

export enum KafkaPattern {
    PlacedItemsBroadcast = "placed.items.broadcast",
}