export interface KafkaOptions {
    clientId?: string
}

export enum KafkaGroupId {
    PlacedItems = "topic-placed-items",
    Action = "topic-action",
    Visit = "topic-visit",
    Delivery = "topic-delivery",
    User = "topic-user",
    Inventories = "topic-inventories",
}

export enum KafkaTopic {
    SyncPlacedItems = "sync-placed-items",
    EmitAction = "emit-action",
    Delivery = "delivery",
    Visit = "visit",
    Return = "return",
    SyncUser = "sync-user",
    SyncInventories = "sync-inventories",
}