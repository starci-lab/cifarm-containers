import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ActionGateway } from "./action-gateway"
import { KafkaConsumersService, KafkaGroupId, KafkaTopic } from "@src/brokers"

@Injectable()
export class ActionConsumer implements OnModuleInit {
    private readonly logger = new Logger(ActionConsumer.name)

    constructor(
        private readonly kafkaConsumersService: KafkaConsumersService,
        private readonly actionGateway: ActionGateway
    ) {}

    async onModuleInit() {
        const consumer = await this.kafkaConsumersService.createConsumer({
            groupId: KafkaGroupId.Action,
            topics: [
                KafkaTopic.EmitAction,
            ]
        }) 
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                this.logger.log(`Received message from topic: ${topic}`)
                switch (topic) {
                case KafkaTopic.EmitAction:
                {
                    const payload = JSON.parse(message.value.toString())
                    await this.actionGateway.emitAction(payload)
                    break
                }
                }
            }
        })
    }
}
