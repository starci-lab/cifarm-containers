import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { configForRoot, kafkaClientRegister } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/services"
import { ThiefCropController } from "./thief-crop.controller"
import { TheifCropService } from "./thief-crop.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        configForRoot(),
        GameplayPostgreSQLModule.forRoot(),
        kafkaClientRegister({
            key: KafkaConfigKey.PlacedItems,
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
