import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayModule } from "@src/gameplay"
import { EnergyWorker } from "./energy.worker"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Energy
        }),
        GameplayModule
    ],
    providers: [EnergyWorker]
})
export class EnergyModule {}
