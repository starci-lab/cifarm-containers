import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { DeliveryWorker } from "./delivery.worker"
@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        })
    ],
    providers: [DeliveryWorker]
})
export class DeliveryModule {}
