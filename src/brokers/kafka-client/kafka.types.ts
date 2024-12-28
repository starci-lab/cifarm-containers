export interface KafkaClientOptions {
    groupId: KafkaGroupId
    producerOnly?: boolean
}

export const KAFKA_CLIENT_OPTIONS = "KAFKA_CLIENT_OPTIONS"
export const KAFKA_CLIENT_NAME = "KAFKA_CLIENT_NAME"

export enum KafkaGroupId {
    PlacedItemsBroadcast = "placed-items-broadcast",
}

export enum KafkaPattern {
    PlacedItemsBroadcast = "placeed.items.broadcast",
}