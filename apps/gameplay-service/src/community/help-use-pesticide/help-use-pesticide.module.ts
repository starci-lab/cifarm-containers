import { Global, Module } from "@nestjs/common"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpUsePesticideController } from "./help-use-pesticide.controller"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { KafkaClientModule, KafkaGroupId } from "@src/brokers"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        KafkaClientModule.forRoot({
            groupId: KafkaGroupId.PlacedItemsBroadcast,
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
