import { Injectable } from "@nestjs/common"
import { Consumer, Kafka } from "kafkajs"
import { KafkaGroupId } from "./types"
import { InjectKafka } from "./kafka.decorators"

@Injectable()
export class KafkaConsumersService {
    constructor(
        @InjectKafka()
        private readonly kafka: Kafka
    ) {}
    // we map the consumers by groupId, so that each backend service can have multiple consumers per groupId
    private consumers: Partial<Record<KafkaGroupId, Consumer>> = {}

    public async createConsumer({ groupId, fromBeginning, topics }: CreateConsumerParams) {
        const consumer = this.kafka.consumer({ groupId, allowAutoTopicCreation: true })
        this.consumers[groupId] = consumer
        await consumer.connect()
        await consumer.subscribe({ topics, fromBeginning })
        this.consumers[groupId] = consumer
        return consumer
    }
}

export interface CreateConsumerParams {
    groupId: KafkaGroupId
    topics?: Array<string>
    fromBeginning?: boolean
}
