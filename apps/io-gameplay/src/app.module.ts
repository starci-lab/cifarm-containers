import { Module } from "@nestjs/common"
import { DefaultModule } from "./default"
import { Container, envConfig, EnvModule } from "@src/env"
import { CacheModule } from "@src/cache"
import { IoModule } from "@src/io"
import { CryptoModule } from "@src/crypto"
import { JwtModule } from "@src/jwt"
import { ScheduleModule } from "@nestjs/schedule"
import { GameplayModule } from "./gameplay"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { KafkaModule } from "@src/brokers"
import { IdModule } from "@src/id"
@Module({
    imports: [
        IdModule.register({
            isGlobal: true,
            name: "IO Gameplay"
        }),
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
        KafkaModule.register({
            isGlobal: true,
            clientId: "io-gameplay",    
        }),
        MongooseModule.forRoot(),
        EventEmitterModule.forRoot({
            global: true
        }),
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
