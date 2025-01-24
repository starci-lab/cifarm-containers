import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { DeliveryService } from "./delivery.service"
import { DeliveryController } from "./delivery.controller"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        })
    ],
    controllers: [DeliveryController],
    providers: [DeliveryService]
})
export class DeliveryModule {}
