import { Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { typeOrmForFeature, kafkaClientRegister } from "@src/dynamic-modules"
import { WsJwtAuthModule } from "@src/guards"
import { BroadcastController } from "./broadcast.controller"
import { BroadcastGateway } from "./broadcast.gateway"

@Module({
    imports: [
        kafkaClientRegister({
            key: KafkaConfigKey.BroadcastPlacedItems,
        }),
        typeOrmForFeature(),
        WsJwtAuthModule,
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
