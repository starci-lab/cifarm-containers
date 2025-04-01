import { DynamicModule, Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import {
    EnvModule,
    MongoDatabase,
    redisClusterEnabled,
    redisClusterRunInDocker,
    RedisType
} from "@src/env"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./health-check.module-definition"
import { MongooseModule } from "@src/databases"
import { ExecModule } from "@src/exec"
import { HealthCheckController } from "./health-check.controller"
import { HealthCheckCoreService } from "./health-check-core.service"
import { HealthCheckContainersService } from "./health-check-containers.service"
import { mongoDbWithMongooseMap, mongoDbMap, redisMap } from "./health-check.utils"
import { HttpModule } from "@nestjs/axios"
import { HealthCheckDependency } from "./health-check.types"
import { MongodbHealthModule } from "./mongodb"

@Module({})
export class HealthCheckModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
        const imports: Array<typeof TerminusModule | DynamicModule> = [
            TerminusModule,
            EnvModule.forRoot(),
            HttpModule.register({})
        ]

        // if http
        const httpDependencies: Array<HealthCheckDependency> = [
            HealthCheckDependency.GraphQLGateway,
            HealthCheckDependency.GameplaySubgraph,
            HealthCheckDependency.CronScheduler,
            HealthCheckDependency.CronWorker,
            HealthCheckDependency.IO
        ]

        if (httpDependencies.some((dependency) => options.dependencies.includes(dependency))) {
            imports.push(HttpModule.register({}))
        }

        // if mongoose are used
        const _mongooseMap = mongoDbWithMongooseMap()
        // if gameplay postgresql is used
        Object.keys(_mongooseMap).forEach((database: MongoDatabase) => {
            if (options.dependencies.includes(_mongooseMap[database].dependency)) {
                imports.push(
                    MongooseModule.forRoot({
                        database,
                    })
                )
            }
        })

        // if mongodb are used
        const _mongoDbMap = mongoDbMap()
        Object.keys(_mongoDbMap).forEach((database: MongoDatabase) => {
            if (options.dependencies.includes(_mongoDbMap[database].dependency)) {
                imports.push(
                    MongodbHealthModule.register({
                        database: MongoDatabase.Adapter,
                        injectionToken: _mongoDbMap[database].token
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
                                enabled: true,
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
