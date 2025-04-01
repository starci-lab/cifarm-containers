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
            groupId: KafkaGroupId.PlacedItems,
            topics: [
                KafkaTopic.SyncPlacedItems,
            ],
            fromBeginning: false
        })
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                this.logger.log(`Received message from topic: ${topic}`)
                switch (topic) {
                case KafkaTopic.SyncPlacedItems:
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
