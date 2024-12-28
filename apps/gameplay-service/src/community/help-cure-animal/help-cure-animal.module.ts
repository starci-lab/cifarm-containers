import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister } from "@src/dynamic-modules"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"
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
    providers: [HelpCureAnimalService],
    exports: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
