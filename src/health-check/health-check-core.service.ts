import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import {
    HealthIndicatorResult,
    MicroserviceHealthIndicator,
    MongooseHealthIndicator,
} from "@nestjs/terminus"
import {
    envConfig,
    redisClusterEnabled,
    redisClusterRunInDocker,
    RedisType,
    MongoDatabase
} from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { NatMap } from "ioredis"
import { HEALTH_CHECK_TIMEOUT } from "./health-check.constants"
import { HealthCheckOptions, HealthCheckDependency } from "./health-check.types"
import { mongoDbWithMongooseMap, mongoDbMap, redisMap } from "./health-check.utils"
import { MongoDbHealthIndicator } from "./mongodb"
import { MODULE_OPTIONS_TOKEN } from "./health-check.module-definition"
import { Connection } from "mongoose"
import { kafkaOptions } from "@src/brokers"

@Injectable()
export class HealthCheckCoreService implements OnModuleInit {
    private readonly logger = new Logger(HealthCheckCoreService.name)

    // Redis cluster services
    private readonly execDockerRedisClusterServices: Partial<
        Record<RedisType, ExecDockerRedisClusterService>
    > = {}

    private readonly mongooseConnections: Partial<Record<MongoDatabase, Connection>> = {}
    private readonly mongoDbs: Partial<Record<MongoDatabase, MongoDbHealthIndicator>> = {}

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private readonly options: HealthCheckOptions,
        private readonly microservice: MicroserviceHealthIndicator,
        private readonly db: MongooseHealthIndicator,
        private readonly moduleRef: ModuleRef
    ) {}

    onModuleInit() {
        this.initializeRedisServices()
        this.initializeMongooseConnections()
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

    // Helper function to initialize Mongoose connections
    private initializeMongooseConnections() {
        const map = mongoDbWithMongooseMap()
        Object.keys(map).forEach((database: MongoDatabase) => {
            if (this.options.dependencies.includes(map[database].dependency)) {
                this.mongooseConnections[database] = this.moduleRef.get<Connection>(map[database].token, {
                    strict: false
                })
            }
        })
    }

    private initializeMongoDbIndicators() {
        const map = mongoDbMap()
        Object.keys(map).forEach((database: MongoDatabase) => {
            if (this.options.dependencies.includes(map[database].dependency)) {
                this.mongoDbs[database] = this.moduleRef.get<MongoDbHealthIndicator>(
                    map[database].token,
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
        return this.microservice.pingCheck<KafkaOptions>("kafka", {
            transport: Transport.KAFKA,
            options: {
                client: kafkaOptions()
            },
            timeout: HEALTH_CHECK_TIMEOUT
        })
    }

    // PostgreSQL ping check method
    public async pingCheckMongoose(
        database: MongoDatabase = MongoDatabase.Gameplay
    ): Promise<HealthIndicatorResult> {
        const map: Partial<Record<MongoDatabase, HealthCheckDependency>> = {
            [MongoDatabase.Gameplay]: HealthCheckDependency.GameplayMongoDb,
        }
        return this.db.pingCheck(map[database], {
            connection: this.mongooseConnections[database],
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
