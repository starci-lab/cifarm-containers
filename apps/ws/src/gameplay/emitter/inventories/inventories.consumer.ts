import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { InventoriesGateway } from "./inventories.gateway"
import { KafkaConsumersService, KafkaGroupId, KafkaTopic } from "@src/brokers"

@Injectable()
export class InventoriesConsumer implements OnModuleInit {
    private readonly logger = new Logger(InventoriesConsumer.name)

    constructor(
        private readonly kafkaConsumersService: KafkaConsumersService,
        private readonly inventoriesGateway: InventoriesGateway
    ) {}

    async onModuleInit() {
        const consumer = await this.kafkaConsumersService.createConsumer({
            groupId: KafkaGroupId.Inventories,
            topics: [KafkaTopic.SyncInventories],
            fromBeginning: true
        })
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                this.logger.log(`Received message from topic: ${topic}`)
                switch (topic) {
                case KafkaTopic.SyncInventories: {
                    const payload = JSON.parse(message.value.toString())
                    this.inventoriesGateway.syncInventories(payload)
                    break
                }
                }
            }
        })
    }
}
