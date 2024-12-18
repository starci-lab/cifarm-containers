import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister, typeOrmForFeature } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/services"
import { ThiefAnimalProductController } from "./thief-animal-product.controller"
import { ThiefAnimalProductService } from "./thief-animal-product.service"

@Global()
@Module({
    imports: [
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
    providers: [ThiefAnimalProductService],
    exports: [ThiefAnimalProductService],
    controllers: [ThiefAnimalProductController]
})
export class ThiefAnimalProductModule {}
