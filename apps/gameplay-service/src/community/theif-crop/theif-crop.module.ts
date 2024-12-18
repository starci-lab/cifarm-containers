import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { configForRoot, kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { TheifCropController } from "./theif-crop.controller"
import { TheifCropService } from "./theif-crop.service"

@Global()
@Module({
    imports: [
        configForRoot(),
        typeOrmForFeature(),
        kafkaClientRegister({
            key: KafkaConfigKey.PlacedItems,
            producerOnly: true
        }),
        EnergyModule,
        LevelModule,
        TheifModule,
        InventoryModule
    ],
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [TheifCropController]
})
export class TheifCropModule {}
