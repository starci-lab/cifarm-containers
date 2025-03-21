import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { CropService } from "./crop.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        })
    ],
    providers: [CropService]
})
export class CropModule {}
