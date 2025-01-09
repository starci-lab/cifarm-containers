import { Inject, Injectable, Logger } from "@nestjs/common"
import { HealthIndicatorResult } from "@nestjs/terminus"
import { MicroserviceHealthIndicator, TypeOrmHealthIndicator } from "@nestjs/terminus"
import { ModuleRef } from "@nestjs/core"
import { HealthCheckDependency, HealthCheckOptions } from "./health-check.types"
import { v4 } from "uuid"
import {
    envConfig,
    RedisType,
    redisClusterEnabled,
    redisClusterRunInDocker,
    PostgreSQLDatabase
} from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"
import {
    ADAPTER_REDIS_INJECTION_TOKEN,
    CACHE_REDIS_INJECTION_TOKEN,
    JOB_REDIS_INJECTION_TOKEN
} from "./health-check.constants"
import { NatMap } from "ioredis"

@Injectable()
export class HealthCheckCoreService {
    private readonly logger = new Logger(HealthCheckCoreService.name)
    // Redis cluster services
    private execDockerRedisClusterServices: Partial<
        Record<RedisType, ExecDockerRedisClusterService>
    > = {}
    // Kafka service
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HealthCheckOptions,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly moduleRef: ModuleRef
    ) {
        // Initialize Redis cluster services
        if (options.dependencies.includes(HealthCheckDependency.JobRedis)) {
            this.execDockerRedisClusterServices[RedisType.Job] = this.moduleRef.get(
                JOB_REDIS_INJECTION_TOKEN,
                { strict: false }
            )
        }
        if (options.dependencies.includes(HealthCheckDependency.CacheRedis)) {
            this.execDockerRedisClusterServices[RedisType.Cache] = this.moduleRef.get(
                CACHE_REDIS_INJECTION_TOKEN,
                { strict: false }
            )
        }
        if (options.dependencies.includes(HealthCheckDependency.AdapterRedis)) {
            this.execDockerRedisClusterServices[RedisType.Adapter] = this.moduleRef.get(
                ADAPTER_REDIS_INJECTION_TOKEN,
                { strict: false }
            )
        }
    }

    // Ping check for Redis
    public async pingCheckRedis(type: RedisType = RedisType.Cache): Promise<HealthIndicatorResult> {
        const clusterEnabled = redisClusterEnabled(RedisType.Cache)
        if (!clusterEnabled) {
            return await this.microservice.pingCheck<RedisOptions>(
                HealthCheckDependency.CacheRedis,
                {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis[RedisType.Cache].host,
                        port: envConfig().databases.redis[RedisType.Cache].port,
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined
                    },
                    timeout: 5000
                }
            )
        }

        let natMap: NatMap
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
            timeout: 5000
        })
    }

    // Ping check for Kafka
    public async pingCheckKafka(): Promise<HealthIndicatorResult> {
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
            timeout: 5000
        })
    }

    // Ping check for PostgreSQL (Gameplay)
    public async pingCheckPostgreSql(
        database: PostgreSQLDatabase = PostgreSQLDatabase.Gameplay
    ): Promise<HealthIndicatorResult> {
        const map: Record<PostgreSQLDatabase, HealthCheckDependency> = {
            [PostgreSQLDatabase.Gameplay]: HealthCheckDependency.GameplayPostgreSQL,
            [PostgreSQLDatabase.Telegram]: HealthCheckDependency.TelegramPostgreSQL
        }
        return this.db.pingCheck(map[database], {
            timeout: 5000
        })
    }
}
