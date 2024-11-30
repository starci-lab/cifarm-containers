import { Module } from "@nestjs/common"
import { BroadcastGateway } from "./broadcast.gateway"
import { WsJwtAuthModule } from "@src/guards"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig, kafkaConfig } from "@src/config"
import { v4 } from "uuid"
import { BroadcastController } from "./broadcast.controller"
import * as Entities from "@src/database"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

@Module({
    imports: [
        TypeOrmModule.forFeature([...Object.values(Entities)]  as Array<EntityClassOrSchema>),
        WsJwtAuthModule,
        ClientsModule.register([
            {
                name: kafkaConfig.broadcastPlacedItems.name,
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: v4(),
                        brokers: Object.values(envConfig().kafka.brokers)
                    },
                    consumer: {
                        groupId: kafkaConfig.broadcastPlacedItems.groupId
                    }
                }
            }
        ])
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
