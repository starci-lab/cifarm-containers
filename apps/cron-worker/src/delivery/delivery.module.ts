import { Module } from "@nestjs/common"
import { BullQueueName } from "@src/config"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { DeliveryWorker } from "./delivery.worker"
import { GoldBalanceModule, TokenBalanceModule } from "@src/services"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Delivery),
        typeOrmForFeature(),
        GoldBalanceModule,
        TokenBalanceModule
    ],
    providers: [DeliveryWorker]
})
export class DeliveryModule {}
