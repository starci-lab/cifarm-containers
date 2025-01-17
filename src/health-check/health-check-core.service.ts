import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import {
    HealthIndicatorResult,
    MicroserviceHealthIndicator,
    TypeOrmHealthIndicator
} from "@nestjs/terminus"
import { KafkaOptionsFactory } from "@src/brokers"
import {
    envConfig,
    PostgreSQLDatabase,
    redisClusterEnabled,
    redisClusterRunInDocker,
    MongoDatabase,
    RedisType
} from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { NatMap } from "ioredis"
import { HEALTH_CHECK_TIMEOUT } from "./health-check.constants"
import { HealthCheckOptions, HealthCheckDependency } from "./health-check.types"
import { dataSourcesMap, mongoDbMap, redisMap } from "./health-check.utils"
import { DataSource } from "typeorm"
import { MongoDbHealthIndicator } from "./mongodb"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"

@Injectable()
export class HealthCheckCoreService implements OnModuleInit {
    private readonly logger = new Logger(HealthCheckCoreService.name)

    // Redis cluster services
    private readonly execDockerRedisClusterServices: Partial<
        Record<RedisType, ExecDockerRedisClusterService>
    > = {}

    private readonly dataSources: Partial<Record<PostgreSQLDatabase, DataSource>> = {}
    private readonly mongoDbs: Partial<Record<MongoDatabase, MongoDbHealthIndicator>> = {}

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HealthCheckOptions,
        private readonly kafkaOptionsFactory: KafkaOptionsFactory,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly moduleRef: ModuleRef
    ) {}

    onModuleInit() {
        this.initializeRedisServices()
        this.initializeDataSources()
        this.initializeMongoDbIndicators()
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
                this.execDockerRedisClusterServices[type] = this.moduleRef.get(map[type].token, {
                    strict: false
                })
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

    private initializeMongoDbIndicators() {
        const mongoDatabases = Object.values(MongoDatabase)
        const _mongoDbMap = mongoDbMap()
        mongoDatabases.forEach((database) => {
            if (this.options.dependencies.includes(_mongoDbMap[database].dependency)) {
                this.mongoDbs[database] = this.moduleRef.get<MongoDbHealthIndicator>(
                    _mongoDbMap[database].token,
                    { strict: false }
                )
            }
        })
    }

    // Generalized Redis ping check method
    public async pingCheckRedis(
        type: RedisType
    ): Promise<HealthIndicatorResult> {
        const clusterEnabled = redisClusterEnabled(type)
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

        let natMap: NatMap
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

    // MongoDB ping check method
    public async pingCheckMongoDb(
        database: MongoDatabase = MongoDatabase.Adapter
    ): Promise<HealthIndicatorResult> {
        return this.mongoDbs[database].check()
    }
}
