import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { CropWorker } from "./crop.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        }),
    ],
    providers: [CropWorker]
})
export class CropModule {}
