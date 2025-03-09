export interface KafkaOptions {
    groupId?: KafkaGroupId
    producerOnlyMode?: boolean
}

export enum KafkaGroupId {
    Gameplay = "gameplay",
}

export enum KafkaPattern {
    SyncPlacedItems = "sync.placed.items",
    EmitAction = "emit.action",
    Delivery = "delivery",
    Visit = "visit",
    Return = "return",
    SyncEnergy = "sync.energy",
}