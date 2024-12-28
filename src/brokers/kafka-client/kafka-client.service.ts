import { Inject, Injectable } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { KAFKA_CLIENT_NAME, KafkaPattern } from "./kafka.types"

@Injectable()
export class KafkaClientService {
    constructor(
        @Inject(KAFKA_CLIENT_NAME) private readonly clientKafka: ClientKafka,
    ) { }

    getClient(): ClientKafka {
        return this.clientKafka
    }

    emit<TData>(pattern: KafkaPattern, data: TData) {
        return this.clientKafka.emit(pattern, data)
    }
}