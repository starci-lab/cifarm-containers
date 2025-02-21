export interface KafkaOptions {
    groupId?: KafkaGroupId
    producerOnlyMode?: boolean
}

export enum KafkaGroupId {
    PlacedItems = "placed-items",
    Delivery = "delivery",
}

export enum KafkaPattern {
    PlacedItems = "placed.items",
    Delivery = "delivery",
    Visit = "visit",
    Return = "return",
}