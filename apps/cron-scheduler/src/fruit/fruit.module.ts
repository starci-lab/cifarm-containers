import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { CropService } from "./fruit.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        })
    ],
    providers: [CropService]
})
export class CropModule {}
