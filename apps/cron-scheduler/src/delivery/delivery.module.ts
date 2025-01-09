import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { DeliveryService } from "./delivery.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        })
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
