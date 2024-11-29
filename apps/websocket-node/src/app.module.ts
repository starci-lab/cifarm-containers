import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { AuthModule } from "./auth"
import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { redisStore } from "cache-manager-redis-yet"
import { BroadcastModule } from "./broadcast"
@Module({
    imports: [  
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
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
                }
            }
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.main.host,
            port: envConfig().database.postgres.gameplay.main.port,
            username: envConfig().database.postgres.gameplay.main.user,
            password: envConfig().database.postgres.gameplay.main.pass,
            database: envConfig().database.postgres.gameplay.main.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        AuthModule,
        BroadcastModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
