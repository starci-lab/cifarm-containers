import { Module } from "@nestjs/common"
import { DefaultModule } from "./default"
import { Container, envConfig, EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { CacheModule } from "@src/cache"
import { IoModule } from "@src/io"
import { CryptoModule } from "@src/crypto"
import { KafkaGroupId, KafkaModule } from "@src/brokers"
import { JwtModule } from "@src/jwt"
import { PostgreSQLModule } from "@src/databases"
import { ScheduleModule } from "@nestjs/schedule"
import { GameplayModule } from "./gameplay"
import { EventEmitterModule } from "@nestjs/event-emitter"

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
            groupId: KafkaGroupId.PlacedItems,
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
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        IoModule.register({
            adapter: envConfig().containers[Container.IoGameplay].adapter,
            isGlobal: true,
            useGlobalImports: true
        }),
        GameplayModule,
        DefaultModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}