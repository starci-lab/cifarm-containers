import { Global, Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { kafkaClientRegister } from "@src/dynamic-modules"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/services"
import { ThiefAnimalProductController } from "./thief-animal-product.controller"
import { ThiefAnimalProductService } from "./thief-animal-product.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
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
    providers: [ThiefAnimalProductService],
    exports: [ThiefAnimalProductService],
    controllers: [ThiefAnimalProductController]
})
export class ThiefAnimalProductModule {}
