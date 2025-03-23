import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { PlantService } from "./plant.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Plant
        })
    ],
    providers: [PlantService]
})
export class PlantModule {}
