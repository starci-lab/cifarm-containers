import { Module } from "@nestjs/common"
import { BullQueueName } from "@src/config"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { DeliveryWorker } from "./delivery.worker"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Delivery),
        typeOrmForFeature(),
    ],
    providers: [DeliveryWorker]
})
export class DeliveryModule {}
