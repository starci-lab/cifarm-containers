import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { AnimalService } from "./animal.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        BullModule.registerQueue({
            queueName: BullQueueName.Animal
        })
    ],
    providers: [AnimalService]
})
export class AnimalModule {}
