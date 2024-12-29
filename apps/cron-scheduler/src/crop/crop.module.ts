import { Module } from "@nestjs/common"
import { BullQueueName, RegisterModule } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { CropService } from "./crop.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        RegisterModule.forRoot({
            queueName: BullQueueName.Crop
        })
    ],
    providers: [CropService]
})
export class CropModule {}
