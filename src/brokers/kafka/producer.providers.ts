import { Provider } from "@nestjs/common"
import { KAFKA, KAFKA_PRODUCER } from "./kafka.constants"
import { Kafka, Producer } from "kafkajs"

export const createKafkaProducerFactoryProvider = (): Provider => ({
    provide: KAFKA_PRODUCER,
    inject: [KAFKA],
    useFactory: async (kafka: Kafka): Promise<Producer> => {
        const producer = kafka.producer()
        await producer.connect()
        return producer
    }
})
