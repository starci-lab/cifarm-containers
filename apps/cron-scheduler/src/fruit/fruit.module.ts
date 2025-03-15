import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { FruitService } from "./fruit.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Fruit
        })
    ],
    providers: [FruitService]
})
export class FruitModule {}
