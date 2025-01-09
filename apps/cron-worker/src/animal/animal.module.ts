import { Module } from "@nestjs/common"
import { AnimalWorker } from "./animal.worker"
import { BullModule, BullQueueName } from "@src/bull"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Animal
        }),
    ],
    providers: [AnimalWorker]
})
export class AnimalModule {}
