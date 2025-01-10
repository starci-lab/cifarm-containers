import { DynamicModule, Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import {
    EnvModule,
    PostgreSQLContext,
    PostgreSQLDatabase,
    redisClusterEnabled,
    redisClusterRunInDocker,
    RedisType
} from "@src/env"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./health-check.module-definition"
import { PostgreSQLModule } from "@src/databases"
import { ExecModule } from "@src/exec"
import { HealthCheckController } from "./health-check.controller"
import { HealthCheckCoreService } from "./health-check-core.service"
import { HealthCheckContainersService } from "./health-check-containers.service"
import { KafkaOptionsModule } from "@src/brokers"
import { dataSourcesMap, redisMap } from "./health-check.utils"
import { HttpModule } from "@nestjs/axios"
import { HealthCheckDependency } from "./health-check.types"

@Module({})
export class HealthCheckModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
        const imports: Array<typeof TerminusModule | DynamicModule> = [
            TerminusModule,
            EnvModule.forRoot(),
            KafkaOptionsModule.register(),
            HttpModule.register({})
        ]

        // if http
        const httpDependencies: Array<HealthCheckDependency> = [
            HealthCheckDependency.RestApiGateway,
            HealthCheckDependency.GameplayService,
            HealthCheckDependency.GraphQLGateway,
            HealthCheckDependency.GameplaySubgraph,
            HealthCheckDependency.CronScheduler,
            HealthCheckDependency.CronWorker,
            HealthCheckDependency.WebsocketNode
        ]

        if (httpDependencies.some((dependency) => options.dependencies.includes(dependency))) {
            imports.push(HttpModule.register({}))
        }

        // if gameplay postgresql is used
        const postgreSqlDatabases = Object.values(PostgreSQLDatabase)
        const _dataSourcesMap = dataSourcesMap()
        // if gameplay postgresql is used
        postgreSqlDatabases.forEach((database) => {
            if (options.dependencies.includes(_dataSourcesMap[database].dependency)) {
                imports.push(
                    PostgreSQLModule.forRoot({
                        context: PostgreSQLContext.Main,
                        database
                    })
                )
            }
        })

        const redisTypes = Object.values(RedisType)
        const _redisMap = redisMap()
        redisTypes.forEach((type) => {
            if (
                options.dependencies.includes(_redisMap[type].dependency) &&
                redisClusterEnabled(type) &&
                redisClusterRunInDocker(type)
            ) {
                imports.push(
                    ExecModule.register({
                        docker: {
                            redisCluster: {
                                type,
                                injectionToken: _redisMap[type].token
                            }
                        }
                    })
                )
            }
        })

        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports,
            providers: [
                ...dynamicModule.providers,
                HealthCheckCoreService,
                HealthCheckContainersService
            ],
            controllers: [HealthCheckController]
        }
    }
}
