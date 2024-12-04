import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { TheifAnimalProductController } from "./theif-animal-product.controller"
import { TheifAnimalProductService } from "./theif-animal-product.service"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        kafkaClientRegister({
            key: KafkaConfigKey.BroadcastPlacedItems,
            producerOnly: true
        }),
        EnergyModule,
        LevelModule,
        TheifModule,
        InventoryModule
    ],
    providers: [TheifAnimalProductService],
    exports: [TheifAnimalProductService],
    controllers: [TheifAnimalProductController]
})
export class TheifAnimalProductModule {}
