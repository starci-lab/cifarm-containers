import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { TheifCropController } from "./theif-crop.controller"
import { TheifCropService } from "./theif-crop.service"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        kafkaClientRegister({
            key: KafkaConfigKey.BroadcastPlacedItems,
            producerOnlyMode: true
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
