import { Global, Module } from "@nestjs/common"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"
import { TheifCropController } from "./theif-crop.controller"
import { TheifCropService } from "./theif-crop.service"
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
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [TheifCropController]
})
export class TheifCropModule {}
