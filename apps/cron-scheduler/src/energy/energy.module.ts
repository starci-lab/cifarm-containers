import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { EnergyService } from "./energy.service"

@Module({
    imports: [
        BullModule.registerQueue({
            queueNames: BullQueueName.Energy
        })
    ],
    providers: [EnergyService]
})
export class EnergyModule {}
