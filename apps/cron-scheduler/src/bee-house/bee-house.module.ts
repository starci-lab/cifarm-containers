import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { BeeHouseService } from "./bee-house.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.BeeHouse
        })
    ],
    providers: [BeeHouseService]
})
export class BeeHouseModule {}
