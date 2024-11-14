import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { GenerateTestSignatureModule } from "./generate-test-signature"
import { RequestMessageModule } from "./request-message"
import { AppController } from "./app.controller"
import { AuthModule as BlockchainAuthModule, JwtModule } from "@src/services"
import { VerifySignatureModule } from "./verify-signature"
import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { redisStore } from "cache-manager-redis-yet"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            username: envConfig().database.postgres.gameplay.user,
            password: envConfig().database.postgres.gameplay.pass,
            database: envConfig().database.postgres.gameplay.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const store = await redisStore({
                    socket: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    }
                })

                return {
                    store: store as unknown as CacheStore,
                    ttl: 3 * 60000 // 3 minutes (milliseconds)
                }
            }
        }),
        BlockchainAuthModule,
        JwtModule,
        RequestMessageModule,
        GenerateTestSignatureModule,
        VerifySignatureModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe
        }
    ]
})
export class AppModule {}
