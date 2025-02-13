import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { AnimalService } from "./animal.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Animal
        })
    ],
    providers: [AnimalService]
})
export class AnimalModule {}
