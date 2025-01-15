export interface KafkaOptions {
    groupId?: KafkaGroupId
    producerOnlyMode?: boolean
}

export enum KafkaGroupId {
    PlacedItems = "placed-items",
}

export enum KafkaPattern {
    PlacedItems = "placed.items",
}