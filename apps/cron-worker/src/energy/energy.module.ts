import { Module } from "@nestjs/common"
import { EnergyWorker } from "./energy.worker"
import { BullModule, BullQueueName } from "@src/bull"
import { EnergyModule as EnergyGameplayModule } from "@src/gameplay"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Energy
        }),
        EnergyGameplayModule
    ],
    providers: [EnergyWorker]
})
export class EnergyModule {}
