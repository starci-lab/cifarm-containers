import { Controller, Get, Inject, Logger } from "@nestjs/common"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import {
    HealthCheck,
    HealthCheckService,
    HealthIndicatorFunction,
    HealthIndicatorResult,
    HttpHealthIndicator,
    MicroserviceHealthIndicator,
    TypeOrmHealthIndicator
} from "@nestjs/terminus"
import { ExecDockerRedisClusterService } from "@src/exec"
import { envConfig, PostgreSQLContext, PostgreSQLDatabase, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { HealthCheckDependency, HealthCheckOptions } from "./health-check.types"
import {
    ADAPTER_REDIS_INJECTION_TOKEN,
    CACHE_REDIS_INJECTION_TOKEN,
    HEALTH_CHECK_ENDPOINT,
    HEALTH_CHECK_TIMEOUT,
    JOB_REDIS_INJECTION_TOKEN
} from "./health-check.constants"
import { NatMap } from "ioredis"
import { v4 } from "uuid"
import { getHttpUrl } from "@src/common"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"
import { ModuleRef } from "@nestjs/core"
import { DataSource } from "typeorm"
import { InjectPostgreSQL } from "@src/databases"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    private execDockerRedisClusterServices: Partial<
        Record<RedisType, ExecDockerRedisClusterService>
    > = {}
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: HealthCheckOptions,
        private readonly health: HealthCheckService,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly http: HttpHealthIndicator,
        // private gameplayPostgreSQLService: GameplayPostgreSQLService,
        @InjectPostgreSQL({
            context: PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Telegram
        })
        private telegramPostgresDatasource: DataSource,
        private readonly moduleRef: ModuleRef,
    ) {
        if (options.dependencies.includes(HealthCheckDependency.JobRedis)) {
            this.execDockerRedisClusterServices[RedisType.Job] = this.moduleRef.get(
                JOB_REDIS_INJECTION_TOKEN,
                // not in current module
                { strict: false }
            )
        }
        if (options.dependencies.includes(HealthCheckDependency.CacheRedis)) {
            this.execDockerRedisClusterServices[RedisType.Cache] = this.moduleRef.get(
                CACHE_REDIS_INJECTION_TOKEN,
                // not in current module
                { strict: false }
            )
        }
        if (options.dependencies.includes(HealthCheckDependency.AdapterRedis)) {
            this.execDockerRedisClusterServices[RedisType.Adapter] = this.moduleRef.get(
                ADAPTER_REDIS_INJECTION_TOKEN,
                // not in current module
                { strict: false }
            )
        }
    }

    // Ping check for Redis
    private async pingCheckRedis(
        type: RedisType = RedisType.Cache
    ): Promise<HealthIndicatorResult> {
        const clusterEnabled = redisClusterEnabled(RedisType.Cache)
        // Check if Redis cluster is enabled
        if (!clusterEnabled) {
            // Redis cluster is not enabled
            return await this.microservice.pingCheck<RedisOptions>(
                HealthCheckDependency.CacheRedis,
                {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis[RedisType.Cache].host,
                        port: envConfig().databases.redis[RedisType.Cache].port,
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined
                    },
                    timeout: HEALTH_CHECK_TIMEOUT
                }
            )
        }
        let natMap: NatMap
        // Check if Redis cluster is running in Docker
        if (redisClusterRunInDocker(type)) {
            natMap = this.execDockerRedisClusterServices[type].getNatMap()
        }

        return await this.microservice.pingCheck<RedisOptions>(type, {
            transport: Transport.REDIS,
            options: {
                host: envConfig().databases.redis[type].host,
                port: envConfig().databases.redis[type].port,
                password: envConfig().databases.redis[type].password,
                preferredSlaves: true,
                natMap
            },
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }

    // Ping check for Kafka
    private async pingCheckKafka(): Promise<HealthIndicatorResult> {
        return await this.microservice.pingCheck<KafkaOptions>(HealthCheckDependency.Kafka, {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: v4(),
                    brokers: [
                        `${envConfig().brokers.kafka.host}:${envConfig().brokers.kafka.port}`
                    ],
                    sasl: {
                        mechanism: "scram-sha-256",
                        username: envConfig().brokers.kafka.sasl.username,
                        password: envConfig().brokers.kafka.sasl.password
                    }
                }
            },
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }

    // Ping check for gameplay Postgres
    private async pingCheckGameplayPostgreSql(): Promise<HealthIndicatorResult> {
        return this.db.pingCheck(HealthCheckDependency.GameplayPostgreSQL, {
            timeout: HEALTH_CHECK_TIMEOUT
            // connection: this.gameplayPostgreSQLService.getDataSource()
        })
    }

    // Ping check for telegram Postgres
    private async pingCheckTelegramPostgreSql(): Promise<HealthIndicatorResult> {
        return this.db.pingCheck(HealthCheckDependency.TelegramPostgreSQL, {
            timeout: HEALTH_CHECK_TIMEOUT,
            connection: this.telegramPostgresDatasource
        })
    }

    // Ping check for gameplay subgraph
    private async pingCheckGameplaySubgraph(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.GameplaySubgraph,
            getHttpUrl({
                host: envConfig().containers.gameplaySubgraph.host,
                port: envConfig().containers.gameplaySubgraph.healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            })
        )
    }

    // Ping check for gameplay service
    private async pingCheckGameplayService(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.GameplayService,
            getHttpUrl({
                host: envConfig().containers.gameplayService.host,
                port: envConfig().containers.gameplayService.healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            })
        )
    }

    // Ping check for websocket node
    private async pingCheckWebsocketNode(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.WebsocketNode,
            getHttpUrl({
                host: envConfig().containers.websocketNode.host,
                port: envConfig().containers.websocketNode.healthCheckPort,
                path: HEALTH_CHECK_ENDPOINT
            })
        )
    }

    // Ping check for graphql gateway
    private async pingCheckGraphQLGateway(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.GraphQLGateway,
            getHttpUrl({
                host: envConfig().containers.graphqlGateway.host,
                port: envConfig().containers.graphqlGateway.healthCheckPort
            })
        )
    }

    // Ping check for rest api gateway
    private async pingCheckRestApiGateway(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.RestApiGateway,
            getHttpUrl({
                host: envConfig().containers.restApiGateway.host,
                port: envConfig().containers.restApiGateway.healthCheckPort
            })
        )
    }

    // ping check for cron scheduler
    private async pingCheckCronScheduler(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.CronScheduler,
            getHttpUrl({
                host: envConfig().containers.cronScheduler.host,
                port: envConfig().containers.cronScheduler.healthCheckPort
            })
        )
    }

    // ping check for cron worker
    private async pingCheckCronWorker(): Promise<HealthIndicatorResult> {
        return await this.http.pingCheck(
            HealthCheckDependency.CronWorker,
            getHttpUrl({
                host: envConfig().containers.cronWorker.host,
                port: envConfig().containers.cronWorker.healthCheckPort
            })
        )
    }

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        const healthIndicators: Array<HealthIndicatorFunction> = []

        // Add ping checks based on the dependencies that are enabled
        if (this.options.dependencies.includes(HealthCheckDependency.GameplayPostgreSQL)) {
            healthIndicators.push(async () => this.pingCheckGameplayPostgreSql())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.TelegramPostgreSQL)) {
            healthIndicators.push(async () => this.pingCheckTelegramPostgreSql())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.CacheRedis)) {
            healthIndicators.push(async () => this.pingCheckRedis(RedisType.Cache))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.AdapterRedis)) {
            healthIndicators.push(async () => this.pingCheckRedis(RedisType.Adapter))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.JobRedis)) {
            healthIndicators.push(async () => this.pingCheckRedis(RedisType.Job))
        }
        if (this.options.dependencies.includes(HealthCheckDependency.Kafka)) {
            healthIndicators.push(async () => this.pingCheckKafka())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.GameplayService)) {
            healthIndicators.push(async () => this.pingCheckGameplayService())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.GameplaySubgraph)) {
            healthIndicators.push(async () => this.pingCheckGameplaySubgraph())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.WebsocketNode)) {
            healthIndicators.push(async () => this.pingCheckWebsocketNode())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.GraphQLGateway)) {
            healthIndicators.push(async () => this.pingCheckGraphQLGateway())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.RestApiGateway)) {
            healthIndicators.push(async () => this.pingCheckRestApiGateway())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.CronScheduler)) {
            healthIndicators.push(async () => this.pingCheckCronScheduler())
        }
        if (this.options.dependencies.includes(HealthCheckDependency.CronWorker)) {
            healthIndicators.push(async () => this.pingCheckCronWorker())
        }

        // Check all the health indicators
        return this.health.check(healthIndicators)
    }
}
