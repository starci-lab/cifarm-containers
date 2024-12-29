import { Module } from "@nestjs/common"
import { BullQueueName, RegisterModule } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { DeliveryService } from "./delivery.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        RegisterModule.forRoot({
            queueName: BullQueueName.Delivery
        })
    ],
    providers: [DeliveryService]
})
export class DeliveryModule {}
