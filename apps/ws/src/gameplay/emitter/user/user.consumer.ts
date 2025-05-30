import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { UserGateway } from "./user.gateway"
import { KafkaConsumersService, KafkaGroupId, KafkaTopic } from "@src/brokers"

@Injectable()
export class UserConsumer implements OnModuleInit {
    private readonly logger = new Logger(UserConsumer.name)

    constructor(
        private readonly kafkaConsumersService: KafkaConsumersService,
        private readonly userGateway: UserGateway
    ) {}

    async onModuleInit() {
        const consumer = await this.kafkaConsumersService.createConsumer({
            groupId: KafkaGroupId.User,
            topics: [KafkaTopic.SyncUser],
            fromBeginning: false
        })
        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                this.logger.log(`Received message from topic: ${topic}`)
                switch (topic) {
                case KafkaTopic.SyncUser: {
                    const payload = JSON.parse(message.value.toString())
                    this.userGateway.syncUser(payload)
                    break
                }
                }
            }
        })
    }
}
