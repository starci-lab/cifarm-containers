import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { DeliveryService } from "./delivery.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        })
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
