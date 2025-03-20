export interface KafkaOptions {
    clientId?: string
}

export enum KafkaGroupId {
    PlacedItems = "topic-placed-items",
    Action = "topic-action",
    Energy = "topic-energy",
    Visit = "topic-visit",
    Delivery = "topic-delivery",
}

export enum KafkaTopic {
    SyncPlacedItems = "sync-placed-items",
    EmitAction = "emit-action",
    Delivery = "delivery",
    Visit = "visit",
    Return = "return",
    SyncEnergy = "sync-energy",
}