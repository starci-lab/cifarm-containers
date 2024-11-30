import { Controller, Logger } from "@nestjs/common"
import { BroadcastPlacedItemsParams } from "./broadcast.dto"
import { BroadcastGateway } from "./broadcast.gateway"
import { MessagePattern } from "@nestjs/microservices"
import { kafkaConfig } from "@src/config"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway) {}

    @MessagePattern(kafkaConfig().broadcastPlacedItems.pattern)
    public async broadcastPlacedItems(params: BroadcastPlacedItemsParams) {
        this.logger.debug(`Broadcasting placed items for user ${params.userId}`)
        return this.broadcastGateway.broadcastPlacedItems(params)
    }
}
