import { Module } from "@nestjs/common"
import { DeliveryService } from "./delivery.service"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { BullQueueName } from "@src/config"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Delivery),
        typeOrmForFeature(),
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
