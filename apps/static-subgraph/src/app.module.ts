import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { redisStore } from "cache-manager-redis-yet"
// import * as apolloPlugins from "@apollo/server/plugin/disabled"
import { Entities } from "@src/database"
import { Modules } from "@apps/static-subgraph/src/"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Object.values(Entities)
        ] as EntityClassOrSchema[]),
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
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
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const store = await redisStore({
                    socket: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    }
                })

                const ttl = envConfig().redis.ttl
                return {
                    store: store as unknown as CacheStore,
                    ttl: ttl
                }
            }
        }),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: ["./**/*.gql"],
            playground: false,
            // plugins: [apolloPlugins.ApolloServerPluginInlineTraceDisabled()],
            buildSchemaOptions: {
                orphanedTypes: []
            }

        }),
        ...Object.values(Modules)
    ],
})
export class AppModule { }
