import { Controller, Get, Logger } from "@nestjs/common"
import { KafkaOptions, RedisOptions, Transport } from "@nestjs/microservices"
import { HealthCheck, HealthCheckService, MicroserviceHealthIndicator, TypeOrmHealthIndicator } from "@nestjs/terminus"
import { kafkaBrokers } from "@src/brokers"
import { envConfig } from "@src/env"
import { HEALTH_CHECK_ENDPOINT, HEALTH_CHECK_TIMEOUT, HealthCheckDependency } from "@src/health-check"

@Controller()
export class HealthCheckController {
    private readonly logger = new Logger(HealthCheckController.name)

    constructor(
        private health: HealthCheckService,
        private microservice: MicroserviceHealthIndicator,
        private db: TypeOrmHealthIndicator,
    ) {}

    @Get(HEALTH_CHECK_ENDPOINT)
    @HealthCheck()
    healthz() {
        return this.health.check([
            async () => this.db.pingCheck(HealthCheckDependency.GameplayPostgreSql, { timeout: HEALTH_CHECK_TIMEOUT }),
            async () =>
                this.microservice.pingCheck<RedisOptions>(HealthCheckDependency.CacheRedis, {
                    transport: Transport.REDIS,
                    options: {
                        host: envConfig().databases.redis.cache.host,
                        port: envConfig().databases.redis.cache.port
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                }),
            async () =>
                this.microservice.pingCheck<KafkaOptions>(HealthCheckDependency.Kafka, {
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            brokers: kafkaBrokers(false),
                        },
                    },
                    timeout: HEALTH_CHECK_TIMEOUT,
                }),
        ])
    }
}