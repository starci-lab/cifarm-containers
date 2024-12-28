import { Global, Module } from "@nestjs/common"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpUseHerbicideController } from "./help-use-herbicide.controller"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
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
    providers: [HelpUseHerbicideService],
    exports: [HelpUseHerbicideService],
    controllers: [HelpUseHerbicideController]
})
export class HelpUseHerbicideModule {}
