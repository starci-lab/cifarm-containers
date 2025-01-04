import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayModule } from "@src/gameplay"
import { EnergyWorker } from "./energy.worker"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Energy
        }),
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [EnergyWorker]
})
export class EnergyModule {}
