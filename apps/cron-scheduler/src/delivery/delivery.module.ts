import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { DeliveryService } from "./delivery.service"
import { deliveryTimeQueueConstants } from "../app.constant"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [
        BullModule.registerQueue({
            name: deliveryTimeQueueConstants.name
        }),
        typeOrmForFeature(),
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
