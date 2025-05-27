import { Module, ValidationPipe } from "@nestjs/common"
import { DefaultNamespaceModule } from "./default"
import { Container, envConfig, EnvModule, RedisType } from "@src/env"
import { CacheModule } from "@src/cache"
import { IoModule } from "@src/io"
import { CryptoModule } from "@src/crypto"
import { JwtModule } from "@src/jwt"
import { ScheduleModule } from "@nestjs/schedule"
import { GameplayNamespaceModule } from "./gameplay"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { KafkaModule } from "@src/brokers"
import { IdModule } from "@src/id"
import { APP_PIPE } from "@nestjs/core"
import { GameplayModule } from "@src/gameplay"
import { ObjectModule } from "@src/object"
import { ThrottlerModule } from "@src/throttler"
import { IoRedisModule } from "@src/native"
@Module({
    imports: [
        IdModule.register({
            isGlobal: true,
            name: "Ws"
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
            clientId: "ws",    
        }),
        MongooseModule.forRoot(),
        ObjectModule.register({
            isGlobal: true,
        }),
        GameplayModule.register({
            isGlobal: true,
            loadStatic: true,
            useGlobalImports: true
        }),
        ScheduleModule.forRoot(),
        IoRedisModule.register({
            type: RedisType.Adapter,
            isGlobal: true
        }),
        IoModule.register({
            useGlobalImports: true,
            adapter: envConfig().containers[Container.Ws].adapter,
            isGlobal: true
        }),
        ThrottlerModule.forRoot(),
        // functional modules
        DefaultNamespaceModule,
        GameplayNamespaceModule,
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
