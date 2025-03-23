import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { BeeHouseWorker } from "./bee-house.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.BeeHouse
        }),
    ],
    providers: [BeeHouseWorker]
})
export class BeeHouseModule {}
