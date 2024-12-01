import { Global, Module } from "@nestjs/common"
import { HelpUseHerbicideController } from "./help-use-herbicide.controller"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { EnergyModule, LevelModule } from "@src/services"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"
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
        LevelModule
    ],
    providers: [HelpUseHerbicideService],
    exports: [HelpUseHerbicideService],
    controllers: [HelpUseHerbicideController]
})
export class HelpUseHerbicideModule {}
