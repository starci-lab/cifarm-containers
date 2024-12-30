import { Module } from "@nestjs/common"
import { KafkaGroupId, KafkaModule } from "@src/brokers"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { JwtModule } from "@src/jwt"
import { BroadcastController } from "./broadcast.controller"
import { BroadcastGateway } from "./broadcast.gateway"

@Module({
    imports: [
        EnvModule.forRoot(),
        KafkaModule.forRoot({
            groupId: KafkaGroupId.PlacedItemsBroadcast,
            producerOnly: true,
        }),
        GameplayPostgreSQLModule.forRoot(),
        JwtModule,
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
