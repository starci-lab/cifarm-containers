import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { EnergyWorker } from "./energy.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Energy
        }),
    ],
    providers: [EnergyWorker]
})
export class EnergyModule {}
