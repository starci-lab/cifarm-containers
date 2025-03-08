import { Controller, Logger } from "@nestjs/common"
import { PlacedItemsGateway } from "./placed-items.gateway"
import { EventPattern, Payload } from "@nestjs/microservices"
import { KafkaPattern } from "@src/brokers"
import { SyncPlacedItemsPayload } from "./placed-items.types"

@Controller()
export class PlacedItemsController {
    private readonly logger = new Logger(PlacedItemsController.name)

    constructor(private readonly placedItemsGateway: PlacedItemsGateway) {}

    @EventPattern(KafkaPattern.PlacedItems)
    async syncPlacedItems(@Payload() payload: SyncPlacedItemsPayload) {
        console.log(payload )
        this.placedItemsGateway.syncPlacedItems({ userId: payload.userId })
    }
}
