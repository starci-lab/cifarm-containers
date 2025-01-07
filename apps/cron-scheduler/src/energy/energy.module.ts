import { Module } from "@nestjs/common"
import { BullModule, BullQueueName } from "@src/bull"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnergyService } from "./energy.service"

@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        BullModule.registerQueue({
            queueName: BullQueueName.Energy
        })
    ],
    providers: [EnergyService]
})
export class EnergyModule {}
