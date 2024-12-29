import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GoldBalanceModule, TokenBalanceModule } from "@src/services"
import { DeliveryWorker } from "./delivery.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        }),
        GoldBalanceModule,
        TokenBalanceModule
    ],
    providers: [DeliveryWorker]
})
export class DeliveryModule {}
