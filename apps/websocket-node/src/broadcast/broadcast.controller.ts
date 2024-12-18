import { AuthController } from "@apps/rest-api-gateway/src/auth"
import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { kafkaConfig, KafkaConfigKey, KafkaPlacedItemPattern } from "@src/config"
import { BroadcastGateway } from "./broadcast.gateway"
import { BroadcastPlacedItemsRequest } from "./broadcast.dto"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway,
        private readonly authController: AuthController
    ) {}

    @EventPattern(kafkaConfig[KafkaConfigKey.PlacedItems].patterns[KafkaPlacedItemPattern.Broadcast])
    async broadcastPlacedItems(@Payload() payload: BroadcastPlacedItemsRequest) {
        this.logger.debug(`Broadcasting placed items: ${JSON.stringify(payload)}`)
        await this.broadcastGateway.broadcastPlacedItems(payload)
    }
}
