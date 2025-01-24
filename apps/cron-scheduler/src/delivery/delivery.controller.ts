import { Controller, Logger } from "@nestjs/common"
import { EventPattern } from "@nestjs/microservices"
import { KafkaPattern } from "@src/brokers"
import { DeliveryService } from "./delivery.service"

@Controller()
export class DeliveryController {
    private readonly logger = new Logger(DeliveryController.name)

    constructor(private readonly deliveryService: DeliveryService) {}

    @EventPattern(KafkaPattern.Delivery)
    async deliver() {
        await this.deliveryService.deliver()
    }
}
