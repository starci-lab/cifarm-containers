import { Inject, Injectable } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { KAFKA_NAME } from "./kafka.types"

@Injectable()
export class KafkaClientService {
    constructor(
        @Inject(KAFKA_NAME) private readonly clientKafka: ClientKafka,
    ) { }

    getClient(): ClientKafka {
        return this.clientKafka
    }
}