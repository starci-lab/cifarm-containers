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
import { HealthCheckDependency } from "./health-check.types"
import { PostgreSQLModule } from "@src/databases"
import { ExecModule } from "@src/exec"
import {
    ADAPTER_REDIS,
    CACHE_REDIS,
    JOB_REDIS
} from "./health-check.constants"
import { HealthCheckController } from "./health-check.controller"
import { HttpModule } from "@nestjs/axios"
import { HealthCheckCoreService } from "./health-check-core.service"
import { HealthCheckContainersService } from "./health-check-containers.service"
import { KafkaOptionsModule } from "@src/brokers"

@Module({})
export class HealthCheckModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
        const imports: Array<typeof TerminusModule | DynamicModule> = [
            TerminusModule,
            EnvModule.forRoot(),
            KafkaOptionsModule.register()
        ]
        if (options.dependencies.includes(HealthCheckDependency.GameplayService)) {
            imports.push(HttpModule.register({}))
        }

        // if gameplay postgresql is used
        if (options.dependencies.includes(HealthCheckDependency.GameplayPostgreSQL)) {
            imports.push(PostgreSQLModule.forRoot())
        }
        if (options.dependencies.includes(HealthCheckDependency.TelegramPostgreSQL)) {
            imports.push(
                PostgreSQLModule.forRoot({
                    context: PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Telegram
                })
            )
        }
        // if adapter redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.AdapterRedis) &&
            redisClusterEnabled(RedisType.Adapter) &&
            redisClusterRunInDocker(RedisType.Adapter)
        ) {
            imports.push(
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type: RedisType.Adapter,
                            injectionToken: ADAPTER_REDIS
                        }
                    }
                })
            )
        }
        // if cache redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.CacheRedis) &&
            redisClusterEnabled(RedisType.Cache) &&
            redisClusterRunInDocker(RedisType.Cache)
        ) {
            imports.push(
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type: RedisType.Cache,
                            injectionToken: CACHE_REDIS
                        }
                    }
                })
            )
        }
        // if job redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.JobRedis) &&
            redisClusterEnabled(RedisType.Job) &&
            redisClusterRunInDocker(RedisType.Job)
        ) {
            imports.push(
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type: RedisType.Job,
                            injectionToken: JOB_REDIS
                        }
                    }
                })
            )
        }
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
