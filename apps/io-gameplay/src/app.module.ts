import { Module, ValidationPipe } from "@nestjs/common"
import { DefaultModule } from "./default"
import { Container, envConfig, EnvModule } from "@src/env"
import { CacheModule } from "@src/cache"
import { IoModule } from "@src/io"
import { CryptoModule } from "@src/crypto"
import { JwtModule } from "@src/jwt"
import { ScheduleModule } from "@nestjs/schedule"
import { Gameplay1Module } from "./gameplay"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { KafkaModule } from "@src/brokers"
import { IdModule } from "@src/id"
import { APP_PIPE } from "@nestjs/core"
import { GameplayModule } from "@src/gameplay"
import { EmitterModule } from "./gameplay/emitter"
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
        GameplayModule.register({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        IoModule.register({
            useGlobalImports: true,
            adapter: envConfig().containers[Container.IoGameplay].adapter,
            isGlobal: true
        }),

        // functional modules
        EmitterModule.register({
            isGlobal: true
        }),
        Gameplay1Module,
        DefaultModule
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                whitelist: true
            })
        },
    ]
})
export class AppModule {}
