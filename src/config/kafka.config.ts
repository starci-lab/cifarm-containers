
export interface KafkaConfigDetails {
    pattern: string
    name: string
    groupId: string
}

export enum KafkaConfigKey {
    BroadcastPlacedItems = "broadcastPlacedItems",
}

export const kafkaConfig: Record<KafkaConfigKey, KafkaConfigDetails> = {
    [KafkaConfigKey.BroadcastPlacedItems]: {
        pattern: "broadcast-placed-items",
        name: "BROADCAST_PLACED_ITEMS",
        groupId: "broadcast-placed-items-group",
    }
}
