import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { FruitWorker } from "./fruit.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Fruit
        }),
    ],
    providers: [FruitWorker]
})
export class FruitModule {}
