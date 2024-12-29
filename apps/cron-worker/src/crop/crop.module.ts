import { Module } from "@nestjs/common"
import { CropWorker } from "./crop.worker"
import { BullModule, BullQueueName } from "@src/bull"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        }),
    ],
    providers: [CropWorker]
})
export class CropModule {}
