import { Module } from "@nestjs/common"
import { KafkaGroupId, KafkaModule } from "@src/brokers"
import { JwtModule } from "@src/jwt"
import { BroadcastController } from "./broadcast.controller"
import { BroadcastGateway } from "./broadcast.gateway"

@Module({
    imports: [
        KafkaModule.register({
            groupId: KafkaGroupId.PlacedItemsBroadcast,
            producerOnlyMode: true,
        }),
        JwtModule,
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
