import { Global, Module } from "@nestjs/common"
import { EnergyModule, InventoryModule, LevelModule, ThiefModule } from "@src/services"
import { ThiefAnimalProductController } from "./thief-animal-product.controller"
import { ThiefAnimalProductService } from "./thief-animal-product.service"
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
        LevelModule,
        ThiefModule,
        InventoryModule
    ],
    providers: [ThiefAnimalProductService],
    exports: [ThiefAnimalProductService],
    controllers: [ThiefAnimalProductController]
})
export class ThiefAnimalProductModule {}
