import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, isProduction, RedisType } from "@src/env"
import { gameplayPostgreSqlEntities } from "./gameplay/entities"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql.module-definition"
import { PostgreSQLContext, PostgreSQLDatabase } from "../databases.types"
import { CONNECTION_TIMEOUT_MS, POOL_SIZE } from "./postgresql.constants"
import { ExecModule, ExecDockerRedisClusterService } from "@src/exec"
import { CacheOptionsService } from "../cache-options.service"
import { getDataSourceName } from "./postgresql.utils"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    networkName:
                        envConfig().databases.redis[RedisType.Cache].cluster.dockerNetworkName
                }
            }
        })
    ],
    providers: [ExecDockerRedisClusterService, CacheOptionsService]
})
export class PostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const database = options.database ?? PostgreSQLDatabase.Gameplay
        const context = options.context ?? PostgreSQLContext.Main
        const dynamicModule = super.forRoot(options)
        const dataSourceName = getDataSourceName(options)
        return {
            ...dynamicModule,
            name: dataSourceName,  
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [CacheOptionsService],
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
                    })
                }),
                TypeOrmModule.forFeature(gameplayPostgreSqlEntities(), dataSourceName)
            ]
        }
    }
}
