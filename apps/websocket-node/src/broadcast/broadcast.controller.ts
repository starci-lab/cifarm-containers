import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { kafkaConfig, KafkaConfigKey, KafkaPlacedItemPattern } from "@src/grpc"
import { BroadcastPlacedItemsRequest } from "./broadcast.dto"
import { BroadcastGateway } from "./broadcast.gateway"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway,
    ) {}

    @EventPattern(kafkaConfig[KafkaConfigKey.PlacedItems].patterns[KafkaPlacedItemPattern.Broadcast])
    async broadcastPlacedItems(@Payload() payload: BroadcastPlacedItemsRequest) {
        this.logger.debug(`Broadcasting placed items: ${JSON.stringify(payload)}`)
        await this.broadcastGateway.broadcastPlacedItems(payload)
    }
}
