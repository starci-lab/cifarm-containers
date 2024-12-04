import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpUseHerbicideController } from "./help-use-herbicide.controller"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        kafkaClientRegister({
            key: KafkaConfigKey.BroadcastPlacedItems,
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
