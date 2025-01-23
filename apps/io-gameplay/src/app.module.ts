import { Module } from "@nestjs/common"
import { DefaultModule } from "./default"
import { Container, envConfig, EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { CacheModule } from "@src/cache"
import { IoModule } from "@src/io"
import { CryptoModule } from "@src/crypto"
import { JwtModule } from "@src/jwt"
import { PostgreSQLModule } from "@src/databases"
import { ScheduleModule } from "@nestjs/schedule"
import { GameplayModule } from "./gameplay"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { DateModule } from "@src/date"

@Module({
    imports: [
        EnvModule.forRoot(),
        CacheModule.register({
            isGlobal: true
        }),
        CryptoModule.register({
            isGlobal: true
        }),
        DateModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            useGlobalImports: true,
            isGlobal: true
        }),
        PostgreSQLModule.forRoot({
            context: PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Gameplay
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        IoModule.register({
            useGlobalImports: true,
            adapter: envConfig().containers[Container.IoGameplay].adapter,
            isGlobal: true
        }),
        GameplayModule,
        DefaultModule
    ]
})
export class AppModule {}
