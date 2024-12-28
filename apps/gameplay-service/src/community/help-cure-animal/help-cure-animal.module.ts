import { Global, Module } from "@nestjs/common"
import { EnergyModule, LevelModule } from "@src/services"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"
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
    providers: [HelpCureAnimalService],
    exports: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
