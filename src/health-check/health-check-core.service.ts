import { Injectable, Logger, Inject, OnModuleInit } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { Transport, KafkaOptions } from "@nestjs/microservices"
import {
    MicroserviceHealthIndicator,
    TypeOrmHealthIndicator,
    HealthIndicatorResult
} from "@nestjs/terminus"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"
import {
    RedisType,
    redisClusterEnabled,
    redisClusterRunInDocker,
    envConfig,
    PostgreSQLDatabase
} from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { NatMap } from "ioredis"
import { RedisOptions } from "@nestjs/microservices"
import {
    HEALTH_CHECK_TIMEOUT,
} from "./health-check.constants"
import { HealthCheckOptions, HealthCheckDependency } from "./health-check.types"
import { KafkaOptionsFactory } from "@src/brokers"
import { dataSourcesMap, redisMap } from "./health-check.utils"
import { DataSource } from "typeorm"

@Injectable()
export class HealthCheckCoreService implements OnModuleInit {
    private readonly logger = new Logger(HealthCheckCoreService.name)
                       
    // Redis cluster services
    private readonly execDockerRedisClusterServices: Partial<
        Record<RedisType, ExecDockerRedisClusterService>
    > = {}

    private readonly dataSources: Partial<Record<PostgreSQLDatabase, DataSource>> = {}

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HealthCheckOptions,
        private readonly kafkaOptionsFactory: KafkaOptionsFactory,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly moduleRef: ModuleRef,
    ) { }

    onModuleInit() {
        this.initializeRedisServices()
        this.initializeDataSources()
    }

    // Helper function to initialize Redis services
    private initializeRedisServices() {
        const redisTypes = Object.values(RedisType)
        const map = redisMap()
        redisTypes.forEach((type) => {
            if (
                this.options.dependencies.includes(map[type].dependency) &&
                redisClusterEnabled(type) &&
                redisClusterRunInDocker(type)
            ) {
                this.execDockerRedisClusterServices[type] = this.moduleRef.get(
                    map[type].token,
                    {
                        strict: false
                    }
                )
            }
        })
    }

    // Helper function to initialize Redis services
    private initializeDataSources() {
        const dataSources = Object.values(PostgreSQLDatabase)
        const map = dataSourcesMap()
        dataSources.forEach((database) => {
            if (this.options.dependencies.includes(map[database].dependency)) {
                this.dataSources[database] = this.moduleRef.get<DataSource>(map[database].token, {
                    strict: false
                })
            }
        })
    }

    // Generalized Redis ping check method
    private async pingCheckRedisCluster(
        type: RedisType,
        clusterEnabled: boolean,
        natMap: NatMap | null = null
    ): Promise<HealthIndicatorResult> {
        if (!clusterEnabled) {
            return this.microservice.pingCheck<RedisOptions>(`${type}Redis`, {
                transport: Transport.REDIS,
                options: {
                    host: envConfig().databases.redis[type].host,
                    port: envConfig().databases.redis[type].port,
                    password: envConfig().databases.redis[type].password || undefined
                },
                timeout: HEALTH_CHECK_TIMEOUT
            })
        }

        if (redisClusterRunInDocker(type)) {
            natMap = await this.execDockerRedisClusterServices[type].getNatMap()
        }

        return this.microservice.pingCheck<RedisOptions>(type, {
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

    // Redis ping check method
    public async pingCheckRedis(type: RedisType = RedisType.Cache): Promise<HealthIndicatorResult> {
        const clusterEnabled = redisClusterEnabled(type)
        return this.pingCheckRedisCluster(type, clusterEnabled)
    }

    // Kafka ping check method
    public async pingCheckKafka(): Promise<HealthIndicatorResult> {
        return this.microservice.pingCheck<KafkaOptions>(HealthCheckDependency.Kafka, {
            transport: Transport.KAFKA,
            options: {
                client: this.kafkaOptionsFactory.createKafkaConfig()
            },
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }

    // PostgreSQL ping check method
    public async pingCheckPostgreSql(
        database: PostgreSQLDatabase = PostgreSQLDatabase.Gameplay
    ): Promise<HealthIndicatorResult> {
        const map: Record<PostgreSQLDatabase, HealthCheckDependency> = {
            [PostgreSQLDatabase.Gameplay]: HealthCheckDependency.GameplayPostgreSQL,
            [PostgreSQLDatabase.Telegram]: HealthCheckDependency.TelegramPostgreSQL
        }
        return this.db.pingCheck(map[database], {
            connection: this.dataSources[database],
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }
}
