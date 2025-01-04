import { Module } from "@nestjs/common"
import { CropWorker } from "./crop.worker"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        }),
        GameplayPostgreSQLModule.forRoot(),
    ],
    providers: [CropWorker]
})
export class CropModule {}
