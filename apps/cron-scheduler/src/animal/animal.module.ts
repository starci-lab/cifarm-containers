import { Module } from "@nestjs/common"
import { BullQueueName, RegisterModule } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { AnimalService } from "./animal.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        RegisterModule.forRoot({
            queueName: BullQueueName.Animal
        })
    ],
    providers: [AnimalService]
})
export class AnimalModule {}
