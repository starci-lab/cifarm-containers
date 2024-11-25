import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { redisStore } from "cache-manager-redis-yet"
import { ToolsModule } from "./tools"

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
                    ttl: Infinity
                }
            }
        }),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: ["./**/*.gql"],
            playground: false,
            // plugins: [ApolloServerPluginInlineTraceDisabled],
            buildSchemaOptions: {
                orphanedTypes: []
            }
        }),
        ToolsModule
        // AnimalsModule,
        // CropsModule,
        // BuildingsModule,
        // DailyRewardsModule,
        // SpinsModule,
        // SuppliesModule,
        // TilesModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
