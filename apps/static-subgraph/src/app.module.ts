import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { ToolsModule } from "./tools"
import { DailyRewardsModule } from "./daily-rewards"
import { SpinsModule } from "./spins"
import { SuppliesModule } from "./supplies"
import { TilesModule } from "./tiles"
import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { redisStore } from "cache-manager-redis-yet"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            username: envConfig().database.postgres.gameplay.user,
            password: envConfig().database.postgres.gameplay.pass,
            database: envConfig().database.postgres.gameplay.dbName,    
            autoLoadEntities: true,
            synchronize: true,
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const store = await redisStore({
                    socket: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port,
                    },
                })
        
                return {
                    store: store as unknown as CacheStore,
                    ttl: Infinity
                }
            },
        }),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: ["./**/*.gql"],
            playground: false,
            //plugins: [ApolloServerPluginInlineTraceDisabled],
            buildSchemaOptions: {
                orphanedTypes: [],
            },
        }),  
        AnimalsModule,
        CropsModule,
        ToolsModule,
        BuildingsModule,
        DailyRewardsModule,
        SpinsModule,
        SuppliesModule,
        TilesModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
