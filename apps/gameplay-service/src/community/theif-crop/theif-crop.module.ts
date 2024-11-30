import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"
import { TheifCropController } from "./theif-crop.controller"
import { TheifCropService } from "./theif-crop.service"

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
        LevelModule,
        TheifModule,
        InventoryModule
    ],
    providers: [TheifCropService],
    exports: [TheifCropService],
    controllers: [TheifCropController]
})
export class TheifCropModule {}
