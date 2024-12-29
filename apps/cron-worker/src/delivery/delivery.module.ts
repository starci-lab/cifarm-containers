import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { DeliveryWorker } from "./delivery.worker"
import { GoldBalanceModule, TokenBalanceModule } from "@src/gameplay"

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
