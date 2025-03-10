import { Inject } from "@nestjs/common"
import { KAFKA, KAFKA_PRODUCER } from "./kafka.constants"

export const InjectKafka = () => Inject(KAFKA)
export const InjectKafkaProducer = () => Inject(KAFKA_PRODUCER)