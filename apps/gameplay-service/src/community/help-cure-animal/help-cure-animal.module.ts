import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as Entities from "@src/database"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"
import { EnergyModule, LevelModule } from "@src/services"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig, kafkaConfig } from "@src/config"
import { v4 } from "uuid"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature(Object.values(Entities) as Array<EntityClassOrSchema>),
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
    providers: [HelpCureAnimalService],
    exports: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
