import { Global, Module } from "@nestjs/common"
import { configForRoot } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/services"
import { ThiefCropController } from "./thief-crop.controller"
import { TheifCropService } from "./thief-crop.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { KafkaClientModule, KafkaGroupId } from "@src/brokers"

@Global()
@Module({
    imports: [
        configForRoot(),
        GameplayPostgreSQLModule.forRoot(),
        KafkaClientModule.forRoot({
            groupId: KafkaGroupId.PlacedItemsBroadcast,
            producerOnly: true
        }),
        EnergyModule,
        LevelModule,
        ThiefModule,
        InventoryModule
    ],
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [ThiefCropController]
})
export class ThiefCropModule {}
