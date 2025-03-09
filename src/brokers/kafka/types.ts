export interface KafkaOptions {
    clientId?: string
}

export enum KafkaGroupId {
    PlacedItems = "placed-items",
    Action = "action",
    Energy = "energy",
    Visit = "visit",
}

export enum KafkaTopic {
    SyncPlacedItems = "sync-placed-items",
    EmitAction = "emit-action",
    Delivery = "delivery",
    Visit = "visit",
    Return = "return",
    SyncEnergy = "sync-energy",
}