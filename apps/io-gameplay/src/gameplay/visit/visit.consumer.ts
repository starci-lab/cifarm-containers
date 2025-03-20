import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { VisitGateway } from "./visit.gateway"
import { KafkaConsumersService, KafkaGroupId, KafkaTopic } from "@src/brokers"

@Injectable()
export class VisitConsumer implements OnModuleInit {
    private readonly logger = new Logger(VisitConsumer.name)
    constructor(
        private readonly kafkaConsumersService: KafkaConsumersService,
        private readonly visitGateway: VisitGateway
    ) {}

    async onModuleInit() {
        const consumer = await this.kafkaConsumersService.createConsumer({
            groupId: KafkaGroupId.Visit,
            topics: [
                KafkaTopic.Visit,
                KafkaTopic.Return,
            ]
        })
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                console.log(topic, message)
                this.logger.log(`Received message from topic: ${topic}`)
                switch (topic) {
                case KafkaTopic.Visit:
                {
                    const payload = JSON.parse(message.value.toString())
                    await this.visitGateway.visit(payload)
                    break
                }
                case KafkaTopic.Return:
                {
                    const payload = JSON.parse(message.value.toString())
                    await this.visitGateway.return(payload)
                    break
                }
                }
            }
        })
    }
}
