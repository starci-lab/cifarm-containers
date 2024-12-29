import { Module } from "@nestjs/common"
import { DeliveryService } from "./delivery.service"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { BullQueueName } from "@src/grpc"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Delivery),
        typeOrmForFeature(),
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
