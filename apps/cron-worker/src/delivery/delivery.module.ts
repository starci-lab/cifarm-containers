import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayModule } from "@src/gameplay"
import { DeliveryWorker } from "./delivery.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        }),
        GameplayModule
    ],
    providers: [DeliveryWorker]
})
export class DeliveryModule {}
