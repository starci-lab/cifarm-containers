export interface KafkaOptions {
    groupId: KafkaGroupId
    producerOnly?: boolean
}

export const KAFKA_OPTIONS = "KAFKA_OPTIONS"
export const KAFKA_NAME = "KAFKA_NAME"

export enum KafkaGroupId {
    PlacedItemsBroadcast = "placed-items-broadcast",
}

export enum KafkaPattern {
    PlacedItemsBroadcast = "placeed.items.broadcast",
}