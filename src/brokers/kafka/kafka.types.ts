export interface KafkaOptions {
    groupId?: KafkaGroupId
    producerOnlyMode?: boolean
}

export enum KafkaGroupId {
    PlacedItems = "placed-items",
    Delivery = "delivery",
}

export enum KafkaPattern {
    SyncPlacedItems = "sync.placed.items",
    EmitAction = "emit.action",
    Delivery = "delivery",
    Visit = "visit",
    Return = "return",
}