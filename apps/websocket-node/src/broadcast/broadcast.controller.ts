import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { kafkaConfig, KafkaConfigKey } from "@src/config"
import { BroadcastGateway } from "./broadcast.gateway"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway) {}

    // @MessagePattern(kafkaConfig[KafkaConfigKey.BroadcastPlacedItems].pattern)
    // public async broadcastPlacedItems(@Payload() payload: any) {
    //     console.log("broadcastPlacedItems", payload)
    //     return {
    //         key: payload,
    //         value: payload
    //     }
    // }

    //Event based
    @EventPattern(kafkaConfig[KafkaConfigKey.BroadcastPlacedItems].pattern)
    async broadcastPlacedItems(@Payload() payload: any) {
        console.log("broadcastPlacedItems", payload)
        return {
            key: payload,
            value: payload
        }
    }
    
}
