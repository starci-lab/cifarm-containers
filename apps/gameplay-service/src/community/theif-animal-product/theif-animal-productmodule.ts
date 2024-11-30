import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnergyModule, InventoryModule, LevelModule, TheifModule } from "@src/services"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import * as Entities from "@src/database"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"
import { TheifAnimalProductController } from "./theif-animal-product.controller"
import { TheifAnimalProductService } from "./theif-animal-product.service"

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
    providers: [TheifAnimalProductService],
    exports: [TheifAnimalProductService],
    controllers: [TheifAnimalProductController]
})
export class TheifAnimalProductModule {}
