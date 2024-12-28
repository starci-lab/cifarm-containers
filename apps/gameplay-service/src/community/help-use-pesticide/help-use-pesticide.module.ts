import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister } from "@src/dynamic-modules"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpUsePesticideController } from "./help-use-pesticide.controller"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
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
    providers: [HelpUsePesticideService],
    exports: [HelpUsePesticideService],
    controllers: [HelpUsePesticideController]
})
export class HelpUsePesticideModule {}
