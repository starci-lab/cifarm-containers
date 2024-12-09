import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"

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
    providers: [HelpCureAnimalService],
    exports: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
