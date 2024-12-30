import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { BroadcastPlacedItemsRequest } from "./broadcast.dto"
import { BroadcastGateway } from "./broadcast.gateway"
import { KafkaPattern } from "@src/brokers"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway,
    ) {}

    @EventPattern(KafkaPattern.PlacedItemsBroadcast)
    async broadcastPlacedItems(@Payload() payload: BroadcastPlacedItemsRequest) {
        this.logger.debug(`Broadcasting placed items: ${JSON.stringify(payload)}`)
        await this.broadcastGateway.broadcastPlacedItems(payload)
    }
}
