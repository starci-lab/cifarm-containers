import { Global, Module } from "@nestjs/common"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"
import { TheifAnimalProductController } from "./theif-animal-product.controller"
import { TheifAnimalProductService } from "./theif-animal-product.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        ClientsModule.register([
            {
                name: kafkaConfig.broadcastPlacedItems.name,
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: v4(),
                        brokers: Object.values(envConfig().kafka.brokers)
                    },
                    producerOnlyMode: true,
                    consumer: {
                        groupId: kafkaConfig.broadcastPlacedItems.groupId
                    }
                }
            }
        ]),
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
