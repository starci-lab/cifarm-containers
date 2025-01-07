import { Module } from "@nestjs/common"
import { AnimalWorker } from "./animal.worker"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Animal
        }),
        GameplayPostgreSQLModule.forFeature(),
    ],
    providers: [AnimalWorker]
})
export class AnimalModule {}
