import { Module } from "@nestjs/common"
import { BroadcastModule } from "./broadcast"
import { DefaultModule } from "./default"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { CacheModule } from "@src/cache"
import { IoAdapterType, IoModule } from "@src/io"
import { CryptoModule } from "@src/crypto"
import { KafkaGroupId, KafkaModule } from "@src/brokers"
import { JwtModule } from "@src/jwt"
import { PostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        EnvModule.forRoot(),
        CacheModule.register({
            isGlobal: true
        }),
        CryptoModule.register({
            isGlobal: true
        }),
        KafkaModule.register({
            groupId: KafkaGroupId.PlacedItemsBroadcast,
            producerOnlyMode: true,
            isGlobal: true
        }),
        JwtModule.register({
            isGlobal: true
        }),
        PostgreSQLModule.forRoot({
            context: PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Gameplay
        }),
        IoModule.register({
            adapter: IoAdapterType.Cluster
        }),
        BroadcastModule,
        DefaultModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}