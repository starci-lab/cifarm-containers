import { Module } from "@nestjs/common"
import { AnimalWorker } from "./animal.worker"
import { BullModule, BullQueueName } from "@src/bull"

@Module({
    imports: [
        BullModule.registerQueue({
            queueNames: BullQueueName.Animal
        }),
    ],
    providers: [AnimalWorker]
})
export class AnimalModule {}
