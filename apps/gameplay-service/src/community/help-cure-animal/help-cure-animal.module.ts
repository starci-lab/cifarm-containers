import { Global, Module } from "@nestjs/common"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"
import { EnergyModule, LevelModule } from "@src/services"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig, kafkaConfig } from "@src/config"
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
                        brokers: [
                            `${envConfig().kafka.brokers.broker1.host}:${envConfig().kafka.brokers.broker1.port}`,
                            `${envConfig().kafka.brokers.broker2.host}:${envConfig().kafka.brokers.broker2.port}`,
                            `${envConfig().kafka.brokers.broker3.host}:${envConfig().kafka.brokers.broker3.port}`,
                        ],
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
    providers: [HelpCureAnimalService],
    exports: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
