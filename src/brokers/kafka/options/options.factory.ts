
import { Injectable } from "@nestjs/common"
import { KafkaConfig } from "@nestjs/microservices/external/kafka.interface"
import { kafkaOptions } from "./options.utils"

@Injectable()
export class KafkaOptionsFactory {
    createKafkaConfig() : KafkaConfig {
        return kafkaOptions()
    }
}