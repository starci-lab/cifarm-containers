import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { PlacedItemsGateway } from "./placed-items.gateway"
import { KafkaConsumersService, KafkaGroupId, KafkaTopic } from "@src/brokers"

@Injectable()
export class PlacedItemsConsumer implements OnModuleInit {
    private readonly logger = new Logger(PlacedItemsConsumer.name)

    constructor(
        private readonly kafkaConsumersService: KafkaConsumersService,
        private readonly placedItemsGateway: PlacedItemsGateway
    ) {}

    async onModuleInit() {
        const consumer = await this.kafkaConsumersService.createConsumer({
            groupId: KafkaGroupId.Action,
            topics: [
                KafkaTopic.SyncPlacedItems,
            ]
        })
        consumer.run({
            eachMessage: async ({ topic, message }) => {
                switch (topic) {
                case KafkaTopic.EmitAction:
                {
                    const payload = JSON.parse(message.value.toString())
                    await this.placedItemsGateway.syncPlacedItems(payload)
                    break
                }
                }
            }
        })
    }
}
