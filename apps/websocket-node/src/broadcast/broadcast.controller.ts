import { Controller, Logger } from "@nestjs/common"
import { BroadcastGateway } from "./broadcast.gateway"
import { MessagePattern, Payload } from "@nestjs/microservices"
import { kafkaConfig, KafkaConfigKey } from "@src/config"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway) {}

    @MessagePattern(kafkaConfig[KafkaConfigKey.BroadcastPlacedItems].pattern)
    public async broadcastPlacedItems(@Payload() payload: any) {
        console.log("broadcastPlacedItems", payload)
        return true
    }
}
