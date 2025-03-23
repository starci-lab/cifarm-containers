import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { PlantWorker } from "./plant.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Plant
        }),
    ],
    providers: [PlantWorker]
})
export class PlantModule {}
