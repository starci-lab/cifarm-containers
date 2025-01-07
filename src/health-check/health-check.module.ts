import { DynamicModule, Module } from "@nestjs/common"
import { HEALTH_CHECK_OPTIONS } from "./health-check.constants"
import { TerminusModule } from "@nestjs/terminus"
import { ChildProcessDockerRedisClusterModule } from "@src/child-process"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule, RedisType } from "@src/env"
import { HealthCheckDependency, HealthCheckOptions } from "./health-check.types"
import { HealthCheckController } from "./health-check.controller"

@Module({})
export class HealthCheckModule {
    public static forRoot(options: HealthCheckOptions) {
        const imports: Array<typeof TerminusModule | DynamicModule> = [
            TerminusModule,
            EnvModule.forRoot()
        ]
        // if gameplay postgresql is used
        if (options.useDependencies.includes(HealthCheckDependency.GameplayPostgreSQL)) {
            imports.push(GameplayPostgreSQLModule.forRoot())
            imports.push(GameplayPostgreSQLModule.forFeature())
        }
        // if adapter redis is used
        if (
            options.useDependencies.includes(HealthCheckDependency.AdapterRedis)
        ) {
            imports.push(ChildProcessDockerRedisClusterModule.forRoot({
                type: RedisType.Adapter
            }))
        }
        // if cache redis is used
        if (
            options.useDependencies.includes(HealthCheckDependency.CacheRedis)
        ) {
            imports.push(ChildProcessDockerRedisClusterModule.forRoot({
                type: RedisType.Cache
            }))
        }
        // if job redis is used
        if (
            options.useDependencies.includes(HealthCheckDependency.JobRedis)
        ) {
            imports.push(ChildProcessDockerRedisClusterModule.forRoot({
                type: RedisType.Job
            }))
        }

        return {
            module: HealthCheckModule,
            imports,
            providers: [{ provide: HEALTH_CHECK_OPTIONS, useValue: options }],
            controllers: [HealthCheckController]
        }
    }
}
