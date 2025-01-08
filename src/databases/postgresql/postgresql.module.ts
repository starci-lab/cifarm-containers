import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, isProduction, RedisType } from "@src/env"
import { gameplayPostgreSqlEntities } from "./gameplay/entities"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql.module-definition"
import { PostgreSQLContext, PostgreSQLDatabase } from "../databases.types"
import { CONNECTION_TIMEOUT_MS, POOL_SIZE } from "./postgresql.constants"
import { ExecModule } from "@src/exec"
import { CacheOptionsService } from "../cache-options.service"
import { getPostgreSqlDataSourceName } from "./postgresql.utils"

@Module({})
export class PostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const database = options.database ?? PostgreSQLDatabase.Gameplay
        const context = options.context ?? PostgreSQLContext.Main
        const dynamicModule = super.forRoot(options)
        const dataSourceName = getPostgreSqlDataSourceName(options)
        return {
            ...dynamicModule, 
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [
                        ExecModule.register({
                            docker: {
                                redisCluster: {
                                    type: RedisType.Cache,
                                }
                            }
                        }),
                    ],
                    extraProviders: [CacheOptionsService],
                    inject: [CacheOptionsService],
                    name: dataSourceName, 
                    useFactory: async (cacheOptionsService: CacheOptionsService) => ({
                        type: "postgres",
                        host: envConfig().databases.postgresql[database][context].host,
                        port: envConfig().databases.postgresql[database][context].port,
                        username: envConfig().databases.postgresql[database][context].username,
                        password: envConfig().databases.postgresql[database][context].password,
                        database: envConfig().databases.postgresql[database][context].dbName,
                        entities: gameplayPostgreSqlEntities(),
                        synchronize: !isProduction(),
                        connectTimeoutMS: CONNECTION_TIMEOUT_MS,
                        poolSize: POOL_SIZE,
                        cache: cacheOptionsService.createCacheOptions(),
                    }),
                }),
                TypeOrmModule.forFeature(gameplayPostgreSqlEntities(), dataSourceName)
            ]
        }
    }
}
