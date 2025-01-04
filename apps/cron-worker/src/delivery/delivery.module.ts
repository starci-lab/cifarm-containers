import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayModule } from "@src/gameplay"
import { DeliveryWorker } from "./delivery.worker"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Delivery
        }),
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [DeliveryWorker]
})
export class DeliveryModule {}
