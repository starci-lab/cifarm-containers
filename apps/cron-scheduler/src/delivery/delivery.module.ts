import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { DeliveryService } from "./delivery.service"
import { CacheModule } from "@src/cache"

@Module({
    imports: [
        CacheModule.register({}),
        BullModule.registerQueue({
            queueNames: BullQueueName.Delivery
        })
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
