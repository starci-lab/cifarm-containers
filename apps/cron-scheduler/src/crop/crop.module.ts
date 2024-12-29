import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { CropService } from "./crop.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        })
    ],
    providers: [CropService]
})
export class CropModule {}
