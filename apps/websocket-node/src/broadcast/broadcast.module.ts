import { Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/grpc"
import { typeOrmForFeature, kafkaClientRegister, configForRoot } from "@src/dynamic-modules"
import { WsJwtAuthModule } from "@src/guards"
import { BroadcastController } from "./broadcast.controller"
import { BroadcastGateway } from "./broadcast.gateway"

@Module({
    imports: [
        configForRoot(),
        kafkaClientRegister({
            key: KafkaConfigKey.PlacedItems,
        }),
        typeOrmForFeature(),
        WsJwtAuthModule,
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
