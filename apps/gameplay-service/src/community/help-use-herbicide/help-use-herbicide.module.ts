import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister } from "@src/dynamic-modules"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpUseHerbicideController } from "./help-use-herbicide.controller"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        kafkaClientRegister({
            key: KafkaConfigKey.PlacedItems,
            producerOnly: true
        }),
        EnergyModule,
        LevelModule
    ],
    providers: [HelpUseHerbicideService],
    exports: [HelpUseHerbicideService],
    controllers: [HelpUseHerbicideController]
})
export class HelpUseHerbicideModule {}
