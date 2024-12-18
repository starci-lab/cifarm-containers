import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { configForRoot, kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/services"
import { ThiefCropController } from "./thief-crop.controller"
import { TheifCropService } from "./thief-crop.service"

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
        ThiefModule,
        InventoryModule
    ],
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [ThiefCropController]
})
export class ThiefCropModule {}
