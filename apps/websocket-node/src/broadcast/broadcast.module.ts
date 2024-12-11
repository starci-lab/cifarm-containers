import { Module } from "@nestjs/common"
import { KafkaConfigKey } from "@src/config"
import { typeOrmForFeature, kafkaClientRegister, configForRoot } from "@src/dynamic-modules"
import { WsJwtAuthModule } from "@src/guards"
import { BroadcastController } from "./broadcast.controller"
import { BroadcastGateway } from "./broadcast.gateway"
import { AppModule as RestApiGatewayModule } from "@apps/rest-api-gateway"

@Module({
    imports: [
        configForRoot(),
        kafkaClientRegister({
            key: KafkaConfigKey.BroadcastPlacedItems,
        }),
        typeOrmForFeature(),
        WsJwtAuthModule,
        RestApiGatewayModule
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
