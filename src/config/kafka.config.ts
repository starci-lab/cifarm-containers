
export interface KafkaConfigDetails {
    patterns: Record<KafkaPlacedItemPattern, string>
    name: string
    groupId: string
}

export enum KafkaConfigKey {
    PlacedItems = "placedItems",
}

export enum KafkaPlacedItemPattern {
    Broadcast = "broadcast",
}

export const kafkaConfig: Record<KafkaConfigKey, KafkaConfigDetails> = {
    [KafkaConfigKey.PlacedItems]: {
        patterns: {
            [KafkaPlacedItemPattern.Broadcast]: "place.broadcast.items",
        },
        name: "PLACED_ITEMS",
        groupId: "placed-items",
    }
}
