import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { EnergyGateway } from "./energy.gateway"
import { KafkaConsumersService, KafkaGroupId, KafkaTopic } from "@src/brokers"

@Injectable()
export class EnergyConsumer implements OnModuleInit {
    private readonly logger = new Logger(EnergyConsumer.name)

    constructor(
        private readonly kafkaConsumersService: KafkaConsumersService,
        private readonly energyGateway: EnergyGateway
    ) {}

    async onModuleInit() {
        const consumer = await this.kafkaConsumersService.createConsumer({
            groupId: KafkaGroupId.Energy,
            topics: [KafkaTopic.SyncEnergy]
        })
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                this.logger.log(`Received message from topic: ${topic}`)
                switch (topic) {
                case KafkaTopic.SyncPlacedItems: {
                    const payload = JSON.parse(message.value.toString())
                    await this.energyGateway.syncEnergy(payload)
                    break
                }
                }
            }
        })
    }
}
